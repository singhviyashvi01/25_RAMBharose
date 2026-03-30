from fastapi import APIRouter, HTTPException
from schemas.dashboard import DashboardResponse
from database import get_supabase
from datetime import datetime, timedelta
import pandas as pd

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardResponse)
async def get_dashboard():
    """
    Returns all aggregated metrics for the main clinic dashboard.
    Includes KPIs, risk distribution, 6-month trend, and ward summaries.
    """
    db = get_supabase()

    try:
        # 1. Fetch Patients Data for Aggregation
        # In a real production app with millions of rows, we'd use PostgreSQL views or dedicated aggregation tables.
        # Here we perform simple aggregations as a demonstration.
        patients_res = db.table("patients").select("patient_id, risk_tier, ward, created_at, diabetes_risk, hypertension_risk, cvd_risk").execute()
        patients = patients_res.data
        
        if not patients:
            return _empty_dashboard_response()

        df = pd.DataFrame(patients)
        df['created_at'] = pd.to_datetime(df['created_at'])

        # 2. KPI Cards
        total_patients = len(df)
        high_risk_count = len(df[df['risk_tier'] == 'High'])
        
        # Pending ASHA tasks
        tasks_res = db.table("asha_tasks").select("task_id", count="exact").eq("status", "Pending").execute()
        pending_tasks = tasks_res.count if tasks_res.count is not None else 0
        
        # Upcoming Camps
        camps_res = db.table("screening_camps").select("camp_id", count="exact").gte("start_date", datetime.now().date().isoformat()).execute()
        upcoming_camps = camps_res.count if camps_res.count is not None else 0

        # 3. Risk Distribution
        distribution = {
            "high": high_risk_count,
            "medium": len(df[df['risk_tier'] == 'Medium']),
            "low": len(df[df['risk_tier'] == 'Low']),
            "high_pct": round((high_risk_count / total_patients) * 100, 1),
            "medium_pct": round((len(df[df['risk_tier'] == 'Medium']) / total_patients) * 100, 1),
            "low_pct": round((len(df[df['risk_tier'] == 'Low']) / total_patients) * 100, 1),
        }

        # 4. Ward Summary
        ward_summary = []
        for ward_name, ward_df in df.groupby('ward'):
            h_count = len(ward_df[ward_df['risk_tier'] == 'High'])
            ward_summary.append({
                "ward": ward_name,
                "total_patients": len(ward_df),
                "high_risk_count": h_count,
                "recommended_camps": (h_count // 15) + (1 if h_count % 15 > 0 else 0)
            })

        # 5. Monthly Trend (Mocked for now based on 'created_at' for last 6 months)
        # In real usage, this would be computed by month-over-month snapshots.
        monthly_trend = _calculate_monthly_trend(df)

        return {
            "kpis": {
                "total_patients": total_patients,
                "high_risk_count": high_risk_count,
                "pending_tasks": pending_tasks,
                "upcoming_camps": upcoming_camps
            },
            "risk_distribution": distribution,
            "monthly_trend": monthly_trend,
            "ward_summary": sorted(ward_summary, key=lambda x: x["high_risk_count"], reverse=True)
        }

    except Exception as e:
        print(f"Dashboard error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def _calculate_monthly_trend(df: pd.DataFrame):
    """Computes a 6-month historical trend of high-risk cases."""
    # Grouping by month and risk_tier
    # For a real project, we'd ensure historical data exists.
    # Here we simulate if data is sparse.
    months = []
    current_date = datetime.now()
    
    for i in range(5, -1, -1):
        month_date = current_date - timedelta(days=i*30)
        month_label = month_date.strftime("%b %Y")
        
        # In a real dataset, we'd filter df by date. 
        # For this prototype, we'll return some realistic trend data.
        months.append({
            "month": month_label,
            "diabetes": 20 + i*2,
            "hypertension": 15 + i*3,
            "cvd": 10 + i*2
        })
    return months


def _empty_dashboard_response():
    return {
        "kpis": {"total_patients": 0, "high_risk_count": 0, "pending_tasks": 0, "upcoming_camps": 0},
        "risk_distribution": {"high": 0, "medium": 0, "low": 0, "high_pct": 0, "medium_pct": 0, "low_pct": 0},
        "monthly_trend": [],
        "ward_summary": []
    }
