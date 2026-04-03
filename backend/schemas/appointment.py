from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional

class AppointmentBase(BaseModel):
    patient_id: str
    patient_name: str
    appointment_date: datetime
    type: str = "Consultation"
    status: str = "Scheduled"
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    appointment_id: UUID
    doctor_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
