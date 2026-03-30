import os
import math
import pandas as pd
from typing import List
from backend.database import get_supabase
from backend.schemas.camps import WardCampPlan, CampPlanResponse

PATIENTS_PER_CAMP = int(os.getenv("CAMP_CAPACITY", 15))


def get_suggested_screenings(ward_df: pd.DataFrame) -> List[str]:
    """
    Recommends screenings based on condition risk distribution in a ward.
    Baseline: Blood Pressure + BMI.
    """
    screenings = ["Blood Pressure Check", "BMI Measurement"]

    # Calculate average risk per condition for the ward
    diabetes_avg = ward_df["diabetes_risk"].mean() if "diabetes_risk" in ward_df else 0
    cvd_avg = ward_df["cvd_risk"].mean() if "cvd_risk" in ward_df else 0
    htn_avg = ward_df["hypertension_risk"].mean() if "hypertension_risk" in ward_df else 0

    if diabetes_avg > 40:
        screenings += ["Blood Glucose (Fasting)", "HbA1c AI Screening"]
    if cvd_avg > 40:
        screenings += ["Lipid Profile", "ECG Referral"]
    if htn_avg > 40:
        screenings.append("Cardiovascular Stress Test")

    return list(dict.fromkeys(screenings))


async def generate_camp_plan(month: str = None) -> CampPlanResponse:
    """
    Aggregates patient risk data by ward and returns camp recommendations.
    Uses NNS (Number Needed to Screen) to rank clinical priority.
    """
    db = get_supabase()
    
    try:
        # 1. Fetch relevant patient fields
        res = db.table("patients").select("ward, risk_tier, diabetes_risk, cvd_risk, hypertension_risk").execute()
        
        if not res.data:
            return CampPlanResponse(month=month or "Current", total_high_risk=0, total_recommended_camps=0, ward_plans=[])

        df = pd.DataFrame(res.data)
        
        ward_plans = []
        total_high_risk = 0
        total_camps = 0

        # 2. Group by Ward
        for ward_name, ward_df in df.groupby('ward'):
            total_pts = len(ward_df)
            high_risk = len(ward_df[ward_df['risk_tier'] == 'High'])
            med_risk = len(ward_df[ward_df['risk_tier'] == 'Medium'])
            
            # NNS = total patients / high-risk cases found
            # A lower NNS indicates higher efficiency for screening outreach.
            nns = round(total_pts / high_risk, 2) if high_risk > 0 else 0
            
            camps_needed = math.ceil(high_risk / PATIENTS_PER_CAMP) if high_risk > 0 else 0
            
            total_high_risk += high_risk
            total_camps += camps_needed

            ward_plans.append(WardCampPlan(
                ward=ward_name,
                total_patients=total_pts,
                high_risk_count=high_risk,
                medium_risk_count=med_risk,
                recommended_camps=camps_needed,
                number_needed_to_screen=nns,
                coverage_percent=round((high_risk / total_pts) * 100, 1) if total_pts > 0 else 0,
                suggested_screenings=get_suggested_screenings(ward_df),
                estimated_patients_per_camp=PATIENTS_PER_CAMP
            ))

        # Sort by NNS (descending, lower is better?) 
        # Actually, prioritize by absolute high risk count first for total impact.
        ward_plans.sort(key=lambda x: x.high_risk_count, reverse=True)

        return CampPlanResponse(
            month=month or "Next Month",
            total_high_risk=total_high_risk,
            total_recommended_camps=total_camps,
            ward_plans=ward_plans
        )

    except Exception as e:
        print(f"Camp Planner Error: {e}")
        return CampPlanResponse(month="Error", total_high_risk=0, total_recommended_camps=0, ward_plans=[])
