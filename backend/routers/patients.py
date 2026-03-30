"""
ROUTER: patients.py
===================
Endpoints:
  GET  /api/patients            — paginated, filtered patient list
  GET  /api/patients/:id        — full patient detail + SHAP + trajectory
  POST /api/patients/:id/assign-asha — assign ASHA worker

Key features:
- Patient list sorted by overall_risk descending
- Patient detail includes pre-computed SHAP factors from DB
- Temporal risk trajectory from patient_risk_history table
- Trajectory label computed from slope of historical assessments
"""
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List

from database import get_supabase
from schemas.patient import (
    PatientDetailResponse,
    PatientWithRisk,
    PatientRiskScore,
    PatientListItem,
    SHAPFactor,
    RiskHistoryPoint,
)

router = APIRouter(prefix="/patients", tags=["Patients"])

PAGE_SIZE = 50


# ── Helpers ──────────────────────────────────────────────────────────────────

def _compute_trajectory_label(history: list) -> str:
    """
    Compute a human-readable trajectory label from historical risk snapshots.
    Uses the slope of overall_risk across the last assessments.
    """
    if len(history) < 2:
        return "Insufficient data"

    # Sort by date ascending
    sorted_h = sorted(history, key=lambda h: h["assessment_date"])
    scores = [float(h["overall_risk"]) for h in sorted_h]

    # Simple linear trend: compare last vs first
    first = scores[0]
    last = scores[-1]
    diff = last - first

    if diff >= 10:
        return "Rapidly worsening"
    elif diff >= 3:
        return "Worsening"
    elif diff <= -10:
        return "Rapidly improving"
    elif diff <= -3:
        return "Improving"
    else:
        return "Stable"


def _row_to_patient_with_risk(row: dict) -> PatientWithRisk:
    """Converts a Supabase patients row dict into a PatientWithRisk model."""
    # Parse SHAP factors from JSONB
    shap_raw = row.get("shap_factors") or []
    shap_factors = []
    for f in shap_raw:
        if isinstance(f, dict):
            shap_factors.append(SHAPFactor(
                feature=f.get("feature", ""),
                value=f.get("value", 0),
                impact=f.get("impact", 0),
                display_label=f.get("display_label", ""),
            ))

    risk_score = None
    if row.get("overall_risk") is not None:
        risk_score = PatientRiskScore(
            diabetes_risk=float(row.get("diabetes_risk", 0)),
            hypertension_risk=float(row.get("hypertension_risk", 0)),
            cvd_risk=float(row.get("cvd_risk", 0)),
            overall_risk=float(row.get("overall_risk", 0)),
            risk_tier=row.get("risk_tier", "Low"),
            top_factors=shap_factors,
            xai_summary=row.get("xai_summary", ""),
        )

    return PatientWithRisk(
        patient_id=row["patient_id"],
        name=row["name"],
        age=row.get("age", 0),
        gender=row.get("gender", "U"),
        weight_kg=row.get("weight_kg"),
        height_cm=row.get("height_cm"),
        bmi=row.get("bmi"),
        systolic_bp=row.get("systolic_bp"),
        diastolic_bp=row.get("diastolic_bp"),
        blood_glucose_fasting=row.get("blood_glucose_fasting"),
        hba1c=row.get("hba1c"),
        cholesterol_total=row.get("cholesterol_total"),
        smoking_status=row.get("smoking_status", 0),
        physical_activity=row.get("physical_activity", 1),
        family_history_diabetes=row.get("family_history_diabetes", 0),
        family_history_hypertension=row.get("family_history_hypertension", 0),
        family_history_cvd=row.get("family_history_cvd", 0),
        income_level=row.get("income_level", "Medium"),
        food_security=row.get("food_security", 1),
        housing_status=row.get("housing_status", "Stable"),
        ward=row.get("ward"),
        last_visit_date=row.get("last_visit_date"),
        asha_worker_id=row.get("asha_worker_id"),
        risk_score=risk_score,
        upload_batch_id=row.get("upload_batch_id"),
    )


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("", response_model=List[PatientListItem])
async def list_patients(
    page: int = Query(1, ge=1),
    tier: Optional[str] = None,
    ward: Optional[str] = None,
    condition: Optional[str] = None,
    has_asha: Optional[bool] = None,
    search: Optional[str] = None,
):
    """
    Returns a paginated list of patients sorted by risk score (desc).
    Supports filtering by tier, ward, condition, ASHA assignment, and name/ID search.
    """
    supabase = get_supabase()
    query = supabase.table("patients").select(
        "patient_id, name, age, gender, overall_risk, risk_tier, "
        "primary_condition, top_factor_label, last_visit_date, ward, asha_worker_id"
    )

    # Apply filters
    if tier:
        query = query.eq("risk_tier", tier)
    if ward:
        query = query.eq("ward", ward)
    if has_asha is True:
        query = query.neq("asha_worker_id", None)
    elif has_asha is False:
        query = query.is_("asha_worker_id", "null")
    if search:
        query = query.or_(
            f"name.ilike.%{search}%,patient_id.ilike.%{search}%"
        )

    # Pagination
    offset = (page - 1) * PAGE_SIZE
    query = query.order("overall_risk", desc=True)
    query = query.range(offset, offset + PAGE_SIZE - 1)

    result = query.execute()
    rows = result.data or []

    patients = []
    for row in rows:
        patients.append(PatientListItem(
            patient_id=row["patient_id"],
            name=row["name"],
            age=row.get("age", 0),
            gender=row.get("gender", "U"),
            overall_risk=float(row.get("overall_risk", 0)),
            risk_tier=row.get("risk_tier", "Low"),
            primary_condition=row.get("primary_condition", "—"),
            top_factor=row.get("top_factor_label", "—"),
            last_visit_date=row.get("last_visit_date"),
            ward=row.get("ward"),
            asha_worker_id=row.get("asha_worker_id"),
        ))

    return patients


@router.get("/{patient_id}", response_model=PatientDetailResponse)
async def get_patient(patient_id: str):
    """
    Returns full patient profile with risk scores, SHAP explanations,
    XAI summary, and temporal risk trajectory.
    """
    supabase = get_supabase()

    # Fetch patient
    result = supabase.table("patients") \
        .select("*") \
        .eq("patient_id", patient_id) \
        .limit(1) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    patient = _row_to_patient_with_risk(result.data[0])

    # Fetch risk trajectory history
    history_result = supabase.table("patient_risk_history") \
        .select("*") \
        .eq("patient_id", patient_id) \
        .order("assessment_date", desc=False) \
        .limit(50) \
        .execute()

    history_data = history_result.data or []

    trajectory_history = [
        RiskHistoryPoint(
            assessment_date=str(h["assessment_date"]),
            diabetes_risk=float(h.get("diabetes_risk", 0)),
            hypertension_risk=float(h.get("hypertension_risk", 0)),
            cvd_risk=float(h.get("cvd_risk", 0)),
            overall_risk=float(h.get("overall_risk", 0)),
            risk_tier=h.get("risk_tier", "Low"),
        )
        for h in history_data
    ]

    trajectory_label = _compute_trajectory_label(history_data)

    return PatientDetailResponse(
        patient=patient,
        trajectory_label=trajectory_label,
        trajectory_history=trajectory_history,
    )


@router.post("/{patient_id}/assign-asha")
async def assign_asha_to_patient(patient_id: str, body: dict):
    """
    Manually assigns an ASHA worker to a patient.
    Creates or updates the corresponding ASHA task record.
    Body: { asha_worker_id: str }
    """
    asha_worker_id = body.get("asha_worker_id")
    if not asha_worker_id:
        raise HTTPException(status_code=400, detail="asha_worker_id is required")

    supabase = get_supabase()

    # Update patient record
    result = supabase.table("patients") \
        .update({"asha_worker_id": asha_worker_id}) \
        .eq("patient_id", patient_id) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    # Create ASHA task
    patient_data = supabase.table("patients") \
        .select("risk_tier") \
        .eq("patient_id", patient_id) \
        .limit(1) \
        .execute()

    priority = "Medium"
    if patient_data.data:
        priority = patient_data.data[0].get("risk_tier", "Medium")

    task_record = {
        "patient_id": patient_id,
        "asha_worker_id": asha_worker_id,
        "task_type": "Home Visit",
        "status": "Pending",
        "priority": priority,
        "notes": f"Auto-assigned to ASHA {asha_worker_id}",
    }
    supabase.table("asha_tasks").insert(task_record).execute()

    return {"message": f"ASHA worker {asha_worker_id} assigned to patient {patient_id}"}
