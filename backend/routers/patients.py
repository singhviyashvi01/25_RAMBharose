from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from schemas.patient import PatientDetailResponse, PatientListItem, PatientWithRisk, PatientRiskScore, SHAPFactor
from database import get_supabase
from ml.explainer import get_shap_factors, build_xai_summary
from ml.preprocessor import preprocess
from utils.risk_calculator import score_to_tier, get_primary_condition
import pandas as pd

router = APIRouter(prefix="/patients", tags=["Patients"])


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
    """
    db = get_supabase()
    query = db.table("patients").select("*")

    if tier:
        query = query.eq("risk_tier", tier)
    if ward:
        query = query.eq("ward", ward)
    if has_asha is not None:
        if has_asha:
            query = query.not_.is_("asha_worker_id", "null")
        else:
            query = query.is_("asha_worker_id", "null")
    if search:
        query = query.or_(f"name.ilike.%{search}%,patient_id.ilike.%{search}%")

    # Pagination: 50 per page
    limit = 50
    offset = (page - 1) * limit
    
    res = query.order("overall_risk", desc=True).range(offset, offset + limit - 1).execute()
    
    items = []
    for row in res.data:
        items.append({
            "patient_id": row["patient_id"],
            "name": row["name"],
            "age": row["age"],
            "gender": row["gender"],
            "overall_risk": float(row["overall_risk"]),
            "risk_tier": row["risk_tier"],
            "primary_condition": row["primary_condition"] or "N/A",
            "top_factor": row["top_factor_label"] or "—",
            "last_visit_date": row["last_visit_date"],
            "ward": row["ward"],
            "asha_worker_id": row["asha_worker_id"]
        })
    return items


@router.get("/{patient_id}", response_model=PatientDetailResponse)
async def get_patient(patient_id: str):
    """
    Returns full patient profile with risk scores, SHAP explanations,
    and XAI summary.
    """
    db = get_supabase()
    res = db.table("patients").select("*").eq("patient_id", patient_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    row = res.data[0]
    
    # Preprocess for SHAP
    df = pd.DataFrame([row])
    preprocessed_df = preprocess(df)
    
    # Calculate SHAP factors for the primary condition
    condition = row["primary_condition"].split()[0].lower() if row["primary_condition"] else "diabetes"
    factors = get_shap_factors(preprocessed_df.iloc[0], condition=condition)
    
    # Build SHAP factor list
    shap_factors = [
        SHAPFactor(
            feature=f["feature"],
            value=f["value"],
            impact=f["impact"],
            display_label=f["display_label"]
        ) for f in factors
    ]
    
    xai_summary = build_xai_summary(factors, row["risk_tier"])
    
    risk_score = PatientRiskScore(
        diabetes_risk=float(row["diabetes_risk"]),
        hypertension_risk=float(row["hypertension_risk"]),
        cvd_risk=float(row["cvd_risk"]),
        overall_risk=float(row["overall_risk"]),
        risk_tier=row["risk_tier"],
        top_factors=shap_factors,
        xai_summary=xai_summary
    )
    
    patient = PatientWithRisk(
        **row,
        risk_score=risk_score
    )
    
    return PatientDetailResponse(
        patient=patient,
        trajectory="Stable"  # Placeholder
    )


@router.post("/{patient_id}/assign-asha")
async def assign_asha_to_patient(patient_id: str, body: dict):
    """
    Manually assigns an ASHA worker to a patient and creates a task.
    """
    db = get_supabase()
    worker_id = body.get("asha_worker_id")
    
    if not worker_id:
        raise HTTPException(status_code=400, detail="asha_worker_id is required")
        
    # Update patient
    db.table("patients").update({"asha_worker_id": worker_id}).eq("patient_id", patient_id).execute()
    
    # Create task
    task_data = {
        "patient_id": patient_id,
        "asha_worker_id": worker_id,
        "task_type": "Home Visit",
        "status": "Pending",
        "priority": "High",
        "due_date": (pd.Timestamp.now() + pd.Timedelta(days=2)).strftime('%Y-%m-%d')
    }
    db.table("asha_tasks").insert(task_data).execute()
    
    # Increment worker task count
    db.rpc("increment_asha_task_count", {"worker_id": worker_id}).execute()
    
    return {"status": "success", "message": f"Assigned worker {worker_id} to patient {patient_id}"}
