from fastapi import APIRouter, Query, HTTPException
from backend.schemas.action_plan import ActionPlanResponse
from backend.database import get_supabase
from backend.services.langchain_service import generate_action_plan
from backend.utils.risk_calculator import score_to_tier, get_primary_condition
from datetime import datetime, timezone

router = APIRouter(prefix="/action-plans", tags=["Action Plans"])


@router.get("/{patient_id}", response_model=ActionPlanResponse)
async def get_action_plan_endpoint(patient_id: str, regenerate: bool = Query(False)):
    """
    Returns the 30-day LangChain-generated action plan for a patient.
    If regenerate=True, bypasses cache and calls LLM fresh.
    """
    db = get_supabase()

    try:
        # 1. Check for cached plan
        if not regenerate:
            plan_res = db.table("action_plans").select("*").eq("patient_id", patient_id).execute()
            if plan_res.data:
                cached_plan = plan_res.data[0]
                # Check if expired? (schema says expires_at column exists)
                # For this prototype, we'll just return it if present
                plan_data = cached_plan["plan_json"]
                plan_data["is_cached"] = True
                return plan_data

        # 2. Fetch patient data for prompt
        patient_res = db.table("patients").select("*").eq("patient_id", patient_id).execute()
        if not patient_res.data:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        patient = patient_res.data[0]
        
        # Prepare data for LangChain
        prompt_data = {
            "name": patient["name"],
            "age": patient["age"],
            "gender": patient["gender"],
            "diabetes_risk": float(patient.get("diabetes_risk", 0)),
            "hypertension_risk": float(patient.get("hypertension_risk", 0)),
            "cvd_risk": float(patient.get("cvd_risk", 0)),
            "top_factors": [patient.get("top_factor_label", "No specific factors identified")],
            "income_level": patient.get("income_level", "Medium"),
            "food_security": int(patient.get("food_security", 1)),
        }

        # 3. Generate plan via LangChain
        generated = await generate_action_plan(prompt_data)
        
        if not generated:
            raise HTTPException(status_code=500, detail="Failed to generate action plan")

        # 4. Format response
        response_data = {
            "patient_id": patient_id,
            "patient_name": patient["name"],
            "overall_risk": float(patient.get("overall_risk", 0)),
            "risk_tier": patient.get("risk_tier", score_to_tier(float(patient.get("overall_risk", 0)))),
            "primary_conditions": [get_primary_condition(
                float(patient.get("diabetes_risk", 0)),
                float(patient.get("hypertension_risk", 0)),
                float(patient.get("cvd_risk", 0))
            )],
            "top_risk_factors": [patient.get("top_factor_label", "—")],
            "plan_steps": generated.get("plan_steps", []),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "is_cached": False
        }

        # 5. Cache result
        # Delete old plan if it exists
        db.table("action_plans").delete().eq("patient_id", patient_id).execute()
        # Insert new plan
        db.table("action_plans").insert({
            "patient_id": patient_id,
            "plan_json": response_data
        }).execute()

        return response_data

    except Exception as e:
        print(f"Action plan error: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))
