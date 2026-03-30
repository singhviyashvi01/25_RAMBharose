from database import get_supabase
from datetime import datetime
db = get_supabase()

now_str = datetime.utcnow().isoformat()

try:
    upcoming_res = db.table("screening_camps").select("*").gte("end_date", now_str).order("start_date").execute()
    print("Upcoming: ", upcoming_res.data)
except Exception as e:
    print("ERROR upcoming:", str(e))
    import traceback
    traceback.print_exc()

try:
    past_res = db.table("screening_camps").select("*").lt("end_date", now_str).order("end_date", desc=True).execute()
    print("Past: ", past_res.data)
except Exception as e:
    print("ERROR past:", str(e))
    import traceback
    traceback.print_exc()
