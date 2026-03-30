import requests

print("Testing /api/camps/plan...")
try:
    r1 = requests.get("http://localhost:8000/api/camps/plan")
    print(r1.status_code)
    print(r1.json())
except Exception as e:
    print(e)
    
print("\nTesting /api/camps...")
try:
    r2 = requests.get("http://localhost:8000/api/camps")
    print(r2.status_code)
    print(r2.text)
except Exception as e:
    print(e)
