import pandas as pd
import random
from datetime import datetime, timedelta

def generate_historical_csv(filename="historical_trend_data.csv", num_patients=10, months=6):
    patients = []
    
    # Base names
    names = ["Aarav", "Priya", "Ishaan", "Ananya", "Vihaan", "Aditi", "Sai", "Kavya", "Arjun", "Diya"]
    wards = ["Ward 21", "Ward 22", "Ward 23"]
    
    # We generate data for each patient for each of the last X months
    for i in range(num_patients):
        p_name = names[i % len(names)] + " " + random.choice(["Sharma", "Verma", "Patel", "Singh"])
        p_age = random.randint(45, 75)
        p_ward = random.choice(wards)
        p_id = f"P-HIST-{i:03d}"
        
        for m in range(months):
            # Calculate a date in the past (e.g. 1st of each month)
            date = datetime.now() - timedelta(days=30 * (months - 1 - m))
            date_str = date.strftime("%Y-%m-%d")
            
            # Create a "trending" risk profile (e.g. risk starts high and goes down or vice versa)
            trend_factor = (m / months) # 0 to 1
            
            # High risk patient (mostly)
            sbp = 160 - (20 * trend_factor) + random.randint(-5, 5)
            glucose = 180 - (40 * trend_factor) + random.randint(-10, 10)
            
            patients.append({
                "patient_id": p_id,
                "name": p_name,
                "age": p_age,
                "gender": random.choice(["M", "F"]),
                "ward": p_ward,
                "systolic_bp": int(sbp),
                "diastolic_bp": 90,
                "blood_glucose_fasting": int(glucose),
                "hba1c": 8.5 - (2.0 * trend_factor),
                "cholesterol_total": 220,
                "bmi": 28.5,
                "smoking_status": 1 if i % 3 == 0 else 0,
                "last_visit_date": date_str,
                "email": "rishitrial1234@gmail.com" if i == 0 else f"dummy{i}@example.com"
            })
            
    df = pd.DataFrame(patients)
    df.to_csv(filename, index=False)
    print(f"✅ Generated {filename} with {len(df)} historical entries across {months} months.")

if __name__ == "__main__":
    generate_historical_csv()
