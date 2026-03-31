import pandas as pd
import random
from datetime import datetime, timedelta

def generate_historical_csv(filename="historical_trend_data.csv", num_patients=50, months=6):
    patients = []
    
    # Base names
    first_names = ["Aarav", "Priya", "Ishaan", "Ananya", "Vihaan", "Aditi", "Sai", "Kavya", "Arjun", "Diya", "Rahul", "Sneha", "Karan", "Neha", "Rohan", "Riya", "Vikas", "Pooja", "Vikram", "Simran", "Deepak", "Swati", "Sanjay", "Megha", "Suresh", "Geeta"]
    last_names = ["Sharma", "Verma", "Patel", "Singh", "Reddy", "Rao", "Kumar", "Iyer", "Chauhan", "Gupta", "Desai"]
    wards = ["Ward 21", "Ward 22", "Ward 23", "Ward 04", "Ward 08", "Ward 09", "Ward 12", "Ward 15"]
    
    # Generate data for each patient for the last X months
    for i in range(num_patients):
        p_name = random.choice(first_names) + " " + random.choice(last_names)
        p_age = random.randint(35, 80)
        p_ward = random.choice(wards)
        p_id = f"P-HIST-{i:03d}"
        
        # Assign base risk tier randomly
        risk_tier = random.choice(["High", "Medium", "Medium", "Low", "Low", "Low"])
        
        for m in range(months):
            # Calculate a date in the past
            date = datetime.now() - timedelta(days=30 * (months - 1 - m))
            date_str = date.strftime("%Y-%m-%d")
            
            # Trend factor simulating slight improvement or fluctuation
            trend_factor = (m / months) 
            
            if risk_tier == "High":
                sbp = 150 - (10 * trend_factor) + random.randint(-10, 15)
                glucose = 180 - (20 * trend_factor) + random.randint(-15, 20)
                hba1c = 8.5 - (1.0 * trend_factor) + random.uniform(-0.5, 0.5)
                cholesterol = 240 - (10 * trend_factor) + random.randint(-10, 10)
                bmi = random.uniform(28.0, 35.0)
            elif risk_tier == "Medium":
                sbp = 135 - (5 * trend_factor) + random.randint(-5, 5)
                glucose = 140 - (10 * trend_factor) + random.randint(-10, 10)
                hba1c = 6.5 - (0.5 * trend_factor) + random.uniform(-0.2, 0.2)
                cholesterol = 200 - (5 * trend_factor) + random.randint(-5, 5)
                bmi = random.uniform(24.0, 29.0)
            else:
                sbp = 115 + random.randint(-5, 5)
                glucose = 95 + random.randint(-5, 5)
                hba1c = 5.2 + random.uniform(-0.2, 0.2)
                cholesterol = 170 + random.randint(-5, 5)
                bmi = random.uniform(19.0, 24.0)
            
            patients.append({
                "patient_id": p_id,
                "name": p_name,
                "age": p_age,
                "gender": random.choice(["M", "F"]),
                "ward": p_ward,
                "systolic_bp": int(sbp),
                "diastolic_bp": int((sbp * 0.6) + random.randint(-5, 5)), # Roughly proportionate
                "blood_glucose_fasting": int(glucose),
                "hba1c": round(hba1c, 1),
                "cholesterol_total": int(cholesterol),
                "bmi": round(bmi, 1),
                "smoking_status": 1 if risk_tier == "High" and random.random() < 0.6 else 0,
                "last_visit_date": date_str,
                "email": "rishitrial1234@gmail.com" if i == 0 else f"dummy_p{i}@example.com"
            })
            
    df = pd.DataFrame(patients)
    df.to_csv(filename, index=False)
    print(f"✅ Generated {filename} with {num_patients} patients ({len(df)} total historical entries across {months} months).")

if __name__ == "__main__":
    generate_historical_csv()
