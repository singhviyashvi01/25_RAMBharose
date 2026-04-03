from fastapi import APIRouter, HTTPException, Query
from backend.schemas.appointment import Appointment, AppointmentCreate
from backend.database import get_supabase
from typing import List, Optional
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/appointments", tags=["Appointments"])

@router.get("", response_model=List[Appointment])
async def get_appointments(doctor_id: Optional[UUID] = None):
    """
    Fetch appointments. Filter by doctor_id if provided.
    """
    db = get_supabase()
    query = db.table("appointments").select("*")
    
    if doctor_id:
        query = query.eq("doctor_id", str(doctor_id))
    
    # Sort by date
    res = query.order("appointment_date", desc=False).execute()
    
    if not res.data:
        return []
    
    return res.data

@router.post("", response_model=Appointment)
async def create_appointment(appointment: AppointmentCreate, doctor_id: UUID):
    """
    Create a new appointment for a specific doctor.
    """
    db = get_supabase()
    
    data = appointment.model_dump()
    data["doctor_id"] = str(doctor_id)
    data["appointment_date"] = appointment.appointment_date.isoformat()
    
    res = db.table("appointments").insert(data).execute()
    
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create appointment")
    
    return res.data[0]

@router.patch("/{appointment_id}", response_model=Appointment)
async def update_appointment(appointment_id: UUID, status: str):
    """
    Update appointment status.
    """
    db = get_supabase()
    
    res = db.table("appointments").update({"status": status, "updated_at": datetime.now().isoformat()}).eq("appointment_id", str(appointment_id)).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return res.data[0]

@router.delete("/{appointment_id}")
async def delete_appointment(appointment_id: UUID):
    """
    Delete an appointment.
    """
    db = get_supabase()
    res = db.table("appointments").delete().eq("appointment_id", str(appointment_id)).execute()
    return {"status": "success"}
