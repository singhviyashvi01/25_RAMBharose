import pandas as pd
import io
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from schemas.upload import UploadResponse
from database import get_supabase
from ml.preprocessor import validate_dataframe, preprocess
from ml.predictor import predict_risk_scores
from ml.explainer import get_top_factor_label
from utils.risk_calculator import score_to_tier, get_primary_condition
from datetime import datetime, timezone

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("", response_model=UploadResponse)
async def upload_dataset(file: UploadFile = File(...)):
    """
    Accepts a CSV or XLSX hospital patient dataset.
    Triggers ML training + risk prediction pipeline.
    Returns batch summary with risk tier counts.
    """
    if not file.filename.endswith(('.csv', '.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload CSV or Excel.")

    try:
        # 1. Read file
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))

        # 2. Validate columns
        is_valid, missing_cols = validate_dataframe(df)
        if not is_valid:
            raise HTTPException(
                status_code=422, 
                detail=f"Missing required columns: {', '.join(missing_cols)}"
            )

        # 3. Predict risk scores (includes training if models don't exist)
        predictions = predict_risk_scores(df)
        
        # 4. Process and Save to Supabase
        db = get_supabase()
        batch_id = str(uuid.uuid4())
        
        # Create batch record
        high_count = sum(1 for p in predictions if p["risk_tier"] == "High")
        medium_count = sum(1 for p in predictions if p["risk_tier"] == "Medium")
        low_count = sum(1 for p in predictions if p["risk_tier"] == "Low")
        
        batch_data = {
            "batch_id": batch_id,
            "filename": file.filename,
            "total_records": len(df),
            "processed": len(df),
            "failed": 0,
            "high_risk_count": high_count,
            "medium_risk_count": medium_count,
            "low_risk_count": low_count,
            "uploaded_at": datetime.now(timezone.utc).isoformat()
        }
        db.table("upload_batches").insert(batch_data).execute()

        # Preprocess for XAI/Labels
        preprocessed_df = preprocess(df)

        # Bulk insert patients
        patient_records = []
        for i, row in df.iterrows():
            pred = next(p for p in predictions if p["patient_id"] == str(row["patient_id"]))
            
            # Determine primary condition
            primary_cond = get_primary_condition(
                pred.get("diabetes_risk", 0),
                pred.get("hypertension_risk", 0),
                pred.get("cvd_risk", 0)
            )
            
            # Get top factor for this patient (short label)
            top_label = get_top_factor_label(preprocessed_df.iloc[i], condition=primary_cond.lower().split()[0])

            record = {
                "patient_id": str(row["patient_id"]),
                "name": row["name"],
                "age": int(row["age"]),
                "gender": row["gender"],
                "weight_kg": float(row.get("weight_kg", 0)),
                "height_cm": float(row.get("height_cm", 0)),
                "bmi": float(preprocessed_df.iloc[i]["bmi"]),
                "systolic_bp": int(row.get("systolic_bp", 120)),
                "diastolic_bp": int(row.get("diastolic_bp", 80)),
                "blood_glucose_fasting": float(row.get("blood_glucose_fasting", 90)),
                "hba1c": float(row.get("hba1c", 5.5)),
                "cholesterol_total": float(row.get("cholesterol_total", 180)),
                "smoking_status": int(row.get("smoking_status", 0)),
                "physical_activity": int(row.get("physical_activity", 1)),
                "family_history_diabetes": int(row.get("family_history_diabetes", 0)),
                "family_history_hypertension": int(row.get("family_history_hypertension", 0)),
                "family_history_cvd": int(row.get("family_history_cvd", 0)),
                "income_level": row.get("income_level", "Medium"),
                "food_security": int(row.get("food_security", 1)),
                "ward": row.get("ward", "General"),
                "upload_batch_id": batch_id,
                "diabetes_risk": pred["diabetes_risk"],
                "hypertension_risk": pred["hypertension_risk"],
                "cvd_risk": pred["cvd_risk"],
                "overall_risk": pred["overall_risk"],
                "risk_tier": pred["risk_tier"],
                "primary_condition": primary_cond,
                "top_factor_label": top_label,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            patient_records.append(record)

        # Batch insert into Supabase
        db.table("patients").upsert(patient_records).execute()

        return UploadResponse(
            batch_id=batch_id,
            total_records=len(df),
            processed=len(df),
            failed=0,
            failed_rows=[],
            high_risk_count=high_count,
            medium_risk_count=medium_count,
            low_risk_count=low_count,
            message=f"Successfully processed {len(df)} records. Identified {high_count} high-risk patients."
        )

    except Exception as e:
        print(f"Upload error: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_upload_history():
    """
    Returns all past upload batches for the authenticated hospital.
    """
    db = get_supabase()
    res = db.table("upload_batches").select("*").order("uploaded_at", desc=True).execute()
    return res.data
