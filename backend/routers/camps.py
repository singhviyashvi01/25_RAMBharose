from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from schemas.camps import CampPlanResponse, CampsListResponse, CreateCampRequest, CampSchedule
from database import get_supabase
from services.camps_service import generate_camp_plan

router = APIRouter(prefix="/camps", tags=["Screening Camps"])


@router.get("/plan", response_model=CampPlanResponse)
async def get_camp_plan_endpoint(
    month: Optional[str] = Query(None, description="Format: YYYY-MM"),
):
    """
    Generates ward-level screening camp recommendations based on current
    risk distribution. Returns NNS metric and suggested screenings.
    """
    return await generate_camp_plan(month)


@router.get("", response_model=CampsListResponse)
async def list_camps():
    """Returns all upcoming and past screening camps."""
    db = get_supabase()
    
    # 1. Fetch upcoming
    upcoming_res = db.table("screening_camps").select("*").gte("end_date", "now()").order("start_date").execute()
    # 2. Fetch past
    past_res = db.table("screening_camps").select("*").lt("end_date", "now()").order("end_date", desc=True).execute()
    
    return {
        "upcoming": upcoming_res.data,
        "past": past_res.data,
        "total_upcoming": len(upcoming_res.data),
        "total_past": len(past_res.data)
    }


@router.post("", response_model=CampSchedule)
async def create_camp_endpoint(body: CreateCampRequest):
    """Schedule a new screening camp for a ward."""
    db = get_supabase()
    
    camp_data = {
        "ward": body.ward,
        "start_date": body.start_date.isoformat(),
        "end_date": body.end_date.isoformat(),
        "venue": body.venue,
        "target_count": body.target_patient_count,
        "status": "Planned",
        "screenings": body.screenings
    }
    
    res = db.table("screening_camps").insert(camp_data).execute()
    
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create screening camp")
        
    return res.data[0]
