from flask import Flask, jsonify
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression
from flask_cors import CORS


app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"]) 

@app.route('/anomalies', methods=['GET'])
def detect_anomalies():
    data = pd.read_csv("src/leave-ai/leave_data.csv")
   
    data['startDate'] = pd.to_datetime(data['startDate'])
    data['endDate'] = pd.to_datetime(data['endDate'])
    data['days'] = (data['endDate'] - data['startDate']).dt.days
    
    model = IsolationForest(contamination=0.2)  
    data['anomaly'] = model.fit_predict(data[['days']])
    
   
    print(data[['employee', 'days', 'anomaly']])

    anomalies = data[data['anomaly'] == -1]
    
    return jsonify(anomalies.to_dict(orient='records'))


@app.route('/forecast', methods=['GET'])
def forecast():
    data = pd.read_csv("src/leave-ai/leave_data.csv")
    
    
    data['startDate'] = pd.to_datetime(data['startDate'], errors='coerce')
    data = data.dropna(subset=['startDate'])  
    
    
    data['month'] = data['startDate'].dt.month
    data['year'] = data['startDate'].dt.year
    
    
    grouped = data.groupby(['year', 'month']).size().reset_index(name='count')

    if len(grouped) < 12:
        print("⚠️ Pas assez de données disponibles pour chaque mois")

    X = grouped[['year', 'month']].values 
    y = grouped['count'].values
    
    # On évite d'ajuster un modèle si les données sont trop petites ou anormales
    if len(X) < 2:
        print("⚠️ Pas assez de données pour entraîner le modèle de régression.")
        return jsonify({"error": "Pas assez de données pour effectuer la prévision."})
    
    model = LinearRegression().fit(X, y)
    
    # Prédictions pour chaque mois
    predictions = {}
    for year in range(data['year'].min(), data['year'].max() + 1):
        for month in range(1, 13):
            prediction = model.predict([[year, month]])  # Prédire chaque mois
            predictions[f"{year}-{month}"] = max(0, round(prediction[0]))  # Pas de valeurs négatives
    
    return jsonify(predictions)


if __name__ == '__main__':
    app.run(port=5001)
