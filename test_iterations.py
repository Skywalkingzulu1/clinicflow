import requests
import json
import time

url = "https://jvsfhrekkkhijneqngax.supabase.co/functions/v1/clinic-flow"
headers = {
    "Content-Type": "application/json",
    "x-skip-signature-verification": "true" # Bypass signature check for testing
}

# Pre-defined test variations
symptoms = [
    "headache", "flu symptoms", "sore throat", "stomach pain", 
    "fever", "cough", "back ache", "ear pain", "skin rash", 
    "muscle cramp", "mild allergy", "toothache", "dizziness", 
    "fatigue", "dry cough"
]

doctors = [
    {"id": 1, "name": "Dr. Sam"},
    {"id": 2, "name": "Dr. Andile"},
    {"id": 3, "name": "Dr. Thami"}
]

print("Starting 30-Iteration Full-Stack Test Suite against live Serverless Function...")
results = []

# Iterations 1-15: Simulate message triage events
for i in range(15):
    iteration_num = i + 1
    symptom = symptoms[i]
    payload = {
        "event": {
            "type": "message",
            "text": f"I need a doctor for my {symptom}",
            "channel": "C12345",
            "user": "U12345"
        }
      }
    
    print(f"Iteration {iteration_num:02d}/30: Simulating Triage Request for '{symptom}'...")
    start_time = time.time()
    response = requests.post(url, headers=headers, json=payload)
    elapsed = time.time() - start_time
    
    status_ok = response.status_code == 200
    results.append({
        "iteration": iteration_num,
        "type": "Triage Request",
        "input": symptom,
        "status_code": response.status_code,
        "elapsed_seconds": round(elapsed, 3),
        "success": status_ok
    })
    time.sleep(0.5) # rate limiting protection

# Iterations 16-30: Simulate interactive booking clicks
for i in range(15):
    iteration_num = i + 16
    symptom = symptoms[i]
    doc = doctors[i % len(doctors)]
    
    payload = {
        "type": "block_actions",
        "user": {
            "username": f"patient_{iteration_num}",
            "name": f"Patient {iteration_num}"
        },
        "actions": [
            {
                "action_id": "book_doctor",
                "value": json.dumps({
                    "doctorId": doc["id"],
                    "doctorName": doc["name"],
                    "reason": f"Consultation for {symptom}"
                })
            }
        ],
        "response_url": None # Skip response url update for mock test
    }
    
    print(f"Iteration {iteration_num:02d}/30: Simulating Booking with {doc['name']} for '{symptom}'...")
    start_time = time.time()
    response = requests.post(url, headers=headers, json=payload)
    elapsed = time.time() - start_time
    
    status_ok = response.status_code == 200
    results.append({
        "iteration": iteration_num,
        "type": "Booking Action",
        "input": f"{doc['name']} - {symptom}",
        "status_code": response.status_code,
        "elapsed_seconds": round(elapsed, 3),
        "success": status_ok
    })
    time.sleep(0.5)

# Summarize results
success_count = sum(1 for r in results if r["success"])
print("\n--- TEST SUITE SUMMARY ---")
print(f"Total Iterations: 30")
print(f"Success Count: {success_count}/30")
print(f"Error Count: {30 - success_count}/30")

# Write results to log file
log_path = "test_results.log"
with open(log_path, "w") as f:
    f.write("ClinicFlow Full-Stack 30-Iteration Verification Log\n")
    f.write("==================================================\n\n")
    f.write(f"Summary: {success_count}/30 succeeded\n\n")
    for r in results:
        f.write(f"[{r['iteration']:02d}/30] Type: {r['type']} | Input: {r['input']} | HTTP {r['status_code']} | Time: {r['elapsed_seconds']}s | Success: {r['success']}\n")

print(f"Test execution traces written to {log_path} successfully.")
