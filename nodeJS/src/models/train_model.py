import pandas as pd
from pymongo import MongoClient
from sklearn.ensemble import IsolationForest
import joblib

# Connexion à MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["emergencyDepartement"]
collection = db["treatments"]

# Charger les données
data = list(collection.find({}, {
    "startDate": 1,
    "endDate": 1,
    "category": 1,
    "status": 1
}))

df = pd.DataFrame(data)
df["startDate"] = pd.to_datetime(df["startDate"])
df["endDate"] = pd.to_datetime(df["endDate"])
df["duration_days"] = (df["endDate"] - df["startDate"]).dt.days.fillna(0)

# Features à utiliser
X = df[["duration_days"]]

# Entraîner Isolation Forest
model = IsolationForest(contamination=0.1, random_state=42)
model.fit(X)

# Sauvegarder le modèle
joblib.dump(model, "treatment_anomaly_model.pkl")
