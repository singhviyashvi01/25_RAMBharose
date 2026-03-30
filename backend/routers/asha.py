from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from backend.schemas.asha import AutoAssignResponse, TaskStatusUpdate, ManualAssignRequest, ASHATask, ASHAWorker
from backend.database import get_supabase
from backend.services.asha_service import auto_assign_asha_tasks

router = APIRouter(prefix="/asha", tags=["ASHA Tasks"])


@router.get("/tasks", response_model=List[ASHATask])
async def list_tasks(
    status: Optional[str] = None,
    ward: Optional[str] = None,
    worker_id: Optional[str] = None,
):
    """Returns ASHA tasks filtered by status, ward, or assigned worker."""
    db = get_supabase()
    query = db.table("asha_tasks").select("*, patients(name, ward, overall_risk, asha_worker_id), asha_workers(name)")
    
    if status:
        query = query.eq("status", status)
    if ward:
        # Note: Filtering on joined patient table ward if needed
        pass
    if worker_id:
        query = query.eq("asha_worker_id", worker_id)
        
    res = query.order("created_at", desc=True).execute()
    
    tasks = []
    for row in res.data:
        tasks.append({
            "task_id": row["task_id"],
            "patient_id": row["patient_id"],
            "patient_name": row["patients"]["name"],
            "patient_risk_score": float(row["patients"]["overall_risk"]),
            "patient_ward": row["patients"]["ward"],
            "asha_worker_id": row["asha_worker_id"],
            "asha_worker_name": row["asha_workers"]["name"] if row["asha_workers"] else None,
            "task_type": row["task_type"],
            "status": row["status"],
            "priority": row["priority"],
            "due_date": row["due_date"],
            "notes": row["notes"],
            "created_at": row["created_at"]
        })
    return tasks


@router.post("/auto-assign", response_model=AutoAssignResponse)
async def auto_assign_tasks_endpoint():
    """
    Auto-assigns nearest available ASHA workers to all unassigned high-risk patients.
    Triggers n8n webhook for SMS notifications.
    """
    return await auto_assign_asha_tasks()


@router.put("/tasks/{task_id}/assign")
async def manually_assign_task(task_id: str, body: ManualAssignRequest):
    """Manually assigns a specific ASHA worker to a task."""
    db = get_supabase()
    
    # 1. Update task
    task_res = db.table("asha_tasks").update({
        "asha_worker_id": body.asha_worker_id,
        "status": "Pending"
    }).eq("task_id", task_id).execute()
    
    if not task_res.data:
        raise HTTPException(status_code=404, detail="Task not found")
        
    patient_id = task_res.data[0]["patient_id"]
    
    # 2. Update patient
    db.table("patients").update({"asha_worker_id": body.asha_worker_id}).eq("patient_id", patient_id).execute()
    
    # 3. Increment worker count
    db.rpc("increment_asha_task_count", {"worker_id": body.asha_worker_id}).execute()
    
    return {"status": "success", "message": f"Task assigned to worker {body.asha_worker_id}"}


@router.patch("/tasks/{task_id}/status")
async def update_task_status_endpoint(task_id: str, body: TaskStatusUpdate):
    """Update a task's status: Pending → InProgress → Done."""
    db = get_supabase()
    
    res = db.table("asha_tasks").update({"status": body.status}).eq("task_id", task_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Task not found")
        
    # If completed, decrement worker's active tasks
    if body.status == "Done":
        worker_id = res.data[0]["asha_worker_id"]
        if worker_id:
            db.rpc("decrement_asha_task_count", {"worker_id": worker_id}).execute()
            
    return {"status": "success", "new_status": body.status}


@router.get("/workers", response_model=List[ASHAWorker])
async def list_workers():
    """Returns all ASHA workers with their active task count and capacity."""
    db = get_supabase()
    res = db.table("asha_workers").select("*").eq("is_active", True).execute()
    return res.data
