"""
ROUTER: simulator.py
====================
Endpoint: POST /api/simulator

What-If Risk Simulation — calculates how changing specific inputs
(e.g., BP, Weight, smoking status) dynamically affects the risk score.

Flow:
1. Load patient's original record from Supabase (patients table)
2. Build a DataFrame row from the record
3. Apply overrides (e.g., bmi=26, smoking_status=0) to the feature vector
4. Run predict_risk_scores() on BOTH original and modified vectors
5. Compute delta (simulated - original) for each condition + overall
6. Build human-readable XAI summary of the simulated change
7. Return SimulatorResponse with original, simulated, delta, and summary

Note: Does NOT save simulation to DB — it's a read-only exploration tool.
"""
import pandas as pd
from fastapi import APIRouter, HTTPException

from backend.database import get_supabase
from backend.ml.preprocessor import preprocess
from backend.ml.predictor import predict_risk_scores
from backend.schemas.simulator import SimulatorRequest, SimulatorResponse, RiskScoreSnapshot
from backend.utils.feature_columns import get_feature_display_value

router = APIRouter(prefix="/simulator", tags=["Risk Simulator"])


def _patient_row_to_df(patient: dict) -> pd.DataFrame:
    """Converts a single patient DB row dict into a one-row DataFrame
    suitable for the preprocessor."""
    return pd.DataFrame([{
        "patient_id": patient["patient_id"],
        "name": patient["name"],
        "age": patient.get("age", 40),
        "gender": patient.get("gender", "U"),
        "weight_kg": patient.get("weight_kg"),
        "height_cm": patient.get("height_cm"),
        "bmi": patient.get("bmi"),
        "systolic_bp": patient.get("systolic_bp"),
        "diastolic_bp": patient.get("diastolic_bp"),
        "blood_glucose_fasting": patient.get("blood_glucose_fasting"),
        "hba1c": patient.get("hba1c"),
        "cholesterol_total": patient.get("cholesterol_total"),
        "smoking_status": patient.get("smoking_status", 0),
        "physical_activity": patient.get("physical_activity", 1),
        "family_history_diabetes": patient.get("family_history_diabetes", 0),
        "family_history_hypertension": patient.get("family_history_hypertension", 0),
        "family_history_cvd": patient.get("family_history_cvd", 0),
        "income_level": patient.get("income_level", "Medium"),
        "food_security": patient.get("food_security", 1),
        "housing_status": patient.get("housing_status", "Stable"),
        "ward": patient.get("ward", ""),
    }])


def _build_xai_change_summary(
    original: RiskScoreSnapshot,
    simulated: RiskScoreSnapshot,
    applied: dict,
) -> str:
    """Builds a human-readable explanation of what changed."""
    orig_o = original.overall_risk
    sim_o = simulated.overall_risk
    delta = round(sim_o - orig_o, 1)

    change_parts = []
    for field, new_val in applied.items():
        label = get_feature_display_value(field, float(new_val))
        change_parts.append(label)

    changes_str = " + ".join(change_parts) if change_parts else "modifications"

    if delta < 0:
        arrow = "↓"
        return (
            f"Risk drops from {orig_o:.0f}% → {sim_o:.0f}% "
            f"({arrow}{abs(delta):.1f}%) with {changes_str}"
        )
    elif delta > 0:
        arrow = "↑"
        return (
            f"Risk increases from {orig_o:.0f}% → {sim_o:.0f}% "
            f"({arrow}{delta:.1f}%) with {changes_str}"
        )
    else:
        return f"Risk unchanged at {orig_o:.0f}% with {changes_str}"


@router.post("", response_model=SimulatorResponse)
async def simulate_risk(body: SimulatorRequest):
    """
    Runs a What-If intervention simulation for a patient.
    Returns original vs simulated risk scores and the delta.
    """
    # 1. Fetch patient from DB
    supabase = get_supabase()
    result = supabase.table("patients") \
        .select("*") \
        .eq("patient_id", body.patient_id) \
        .limit(1) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail=f"Patient {body.patient_id} not found")

    patient = result.data[0]

    # 2. Build original DF and compute original risk
    original_df = _patient_row_to_df(patient)
    original_df_processed = preprocess(original_df)
    original_results = predict_risk_scores(original_df_processed)

    if not original_results:
        raise HTTPException(status_code=500, detail="Failed to compute original risk scores")

    orig = original_results[0]
    original_snapshot = RiskScoreSnapshot(
        diabetes_risk=orig["diabetes_risk"],
        hypertension_risk=orig["hypertension_risk"],
        cvd_risk=orig["cvd_risk"],
        overall_risk=orig["overall_risk"],
        risk_tier=orig["risk_tier"],
    )

    # 3. Apply overrides to create simulated DF
    overrides = body.overrides.model_dump(exclude_none=True)
    simulated_df = _patient_row_to_df(patient)

    for field, value in overrides.items():
        if field in simulated_df.columns:
            simulated_df[field] = value
        # Handle weight_kg override → recalculate BMI
        if field == "weight_kg" and "height_cm" in simulated_df.columns:
            height = simulated_df["height_cm"].iloc[0]
            if height and height > 0:
                simulated_df["bmi"] = value / ((height / 100) ** 2)

    simulated_df_processed = preprocess(simulated_df)
    simulated_results = predict_risk_scores(simulated_df_processed)

    if not simulated_results:
        raise HTTPException(status_code=500, detail="Failed to compute simulated risk scores")

    sim = simulated_results[0]
    simulated_snapshot = RiskScoreSnapshot(
        diabetes_risk=sim["diabetes_risk"],
        hypertension_risk=sim["hypertension_risk"],
        cvd_risk=sim["cvd_risk"],
        overall_risk=sim["overall_risk"],
        risk_tier=sim["risk_tier"],
    )

    # 4. Compute deltas
    delta = {
        "diabetes_risk": round(sim["diabetes_risk"] - orig["diabetes_risk"], 1),
        "hypertension_risk": round(sim["hypertension_risk"] - orig["hypertension_risk"], 1),
        "cvd_risk": round(sim["cvd_risk"] - orig["cvd_risk"], 1),
        "overall_risk": round(sim["overall_risk"] - orig["overall_risk"], 1),
    }

    # 5. Build XAI summary
    xai_summary = _build_xai_change_summary(original_snapshot, simulated_snapshot, overrides)

    return SimulatorResponse(
        patient_id=body.patient_id,
        patient_name=patient.get("name", "Unknown"),
        original=original_snapshot,
        simulated=simulated_snapshot,
        delta=delta,
        xai_summary=xai_summary,
        applied_overrides=overrides,
    )
