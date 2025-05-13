import pandas as pd
from pymongo import MongoClient
import joblib
import json
import sys
from bson import ObjectId
import os

# Load the model
model_path = os.path.join(os.path.dirname(__file__), 'treatment_anomaly_model.pkl')
model = joblib.load(model_path)

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["emergencyDepartement"]
treatments_collection = db["treatments"]
patients_collection = db["patients"]  

# Fetch treatments data with more fields
data = list(treatments_collection.find({}, {
    "_id": 1,
    "startDate": 1,
    "endDate": 1,
    "category": 1,
    "status": 1,
    "details": 1,
    "treatedBy": 1,
    "equipment": 1,
    "patient": 1
}))

# Normalize and convert ObjectIds to strings
for d in data:
    d["_id"] = str(d["_id"])

    # Normalize patient
    patient = d.get("patient", None)
    if isinstance(patient, dict) and "_id" in patient:
        d["patient"] = str(patient["_id"])
    elif isinstance(patient, ObjectId):
        d["patient"] = str(patient)
    else:
        d["patient"] = None

    # Normalize treatedBy
    treated = d.get("treatedBy", [])
    if isinstance(treated, list):
        d["treatedBy"] = [str(p.get("_id")) for p in treated if isinstance(p, dict) and "_id" in p]
    elif isinstance(treated, dict) and "_id" in treated:
        d["treatedBy"] = [str(treated["_id"])]
    elif isinstance(treated, ObjectId):
        d["treatedBy"] = [str(treated)]
    else:
        d["treatedBy"] = []

    # Normalize equipment
    equip = d.get("equipment", [])
    if isinstance(equip, list):
        d["equipment"] = [str(e.get("_id")) for e in equip if isinstance(e, dict) and "_id" in e]
    elif isinstance(equip, dict) and "_id" in equip:
        d["equipment"] = [str(equip["_id"])]
    elif isinstance(equip, ObjectId):
        d["equipment"] = [str(equip)]
    else:
        d["equipment"] = []

# Create DataFrame
df = pd.DataFrame(data)
df["startDate"] = pd.to_datetime(df["startDate"], errors='coerce')
df["endDate"] = pd.to_datetime(df["endDate"], errors='coerce')
df["duration_days"] = (df["endDate"] - df["startDate"]).dt.total_seconds() / (24 * 3600)

# Apply anomaly detection model
X = df[["duration_days"]]
df["anomaly"] = model.predict(X)

# Get anomalies with all treatment details
anomalies = df[df["anomaly"] == -1].to_dict('records')

# Output clean JSON
sys.stdout.write(json.dumps(anomalies, default=str))
