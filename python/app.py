


# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
app = Flask(__name__)
CORS(app)

# Charge ton pipeline tel quel (scaler + knn)
pipeline = joblib.load("../python/triage_full_pipeline (3).joblib")
# Load the saved KMeans model
kmeans = joblib.load('kmeans_model.pkl')
# Optional: load scaler if used
scaler = joblib.load('scaler.pkl')

# Moyennes & écarts-types que tu utilisais pour normaliser manuellement
MEANS = {
    'age':                  47.647910,
    'PainGrade':            1.434690,
    'Source':               1.677613,
    'BlooddpressurSystol': 110.744596,
    'O2Saturation':         95.796707
}
STDS = {
    'age':                  22.240436,
    'PainGrade':            1.660787,
    'Source':               0.467739,
    'BlooddpressurSystol':  4.745882,
    'O2Saturation':         1.272364
}

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    required = ['age','PainGrade','Source','BlooddpressurSystol','O2Saturation']
    missing  = [k for k in required if k not in data]
    if missing:
        return jsonify({"error": f"Champs manquants : {missing}"}), 400

    # 1) Pré-normalisation manuelle
    data_norm = {
        feat: (data[feat] - MEANS[feat]) / STDS[feat]
        for feat in MEANS
    }

    # 2) Construction du DataFrame NORMALISÉ
    df_norm = pd.DataFrame([{
        'age':                  data_norm['age'],
        'PainGrade':            data_norm['PainGrade'],
        'Source':               data_norm['Source'],
        'BlooddpressurSystol':  data_norm['BlooddpressurSystol'],
        'O2Saturation':         data_norm['O2Saturation']
    }])

    # (optionnel) DEBUG
    print(">> raw in :", {k: data[k] for k in data_norm})
    print(">> norm in:", df_norm.to_dict(orient="records"))

    # 3) Prédiction avec ton pipeline existant
    try:
        pred = pipeline.predict(df_norm)[0]
        return jsonify({"triage_grade": int(pred)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@app.route('/clustering', methods=['GET', 'POST'])
def clustering():
    try:
        # 1. Raw input (5 known values)
        # input_features = [13.0, 3, 1.740494, 130.805635, 95.200907]

        # 2. Pad the rest (14 missing features) with zeros
        # full_input = input_features + [0] * (19 - len(input_features))
    
        full_input_array = np.array([[	1.319767	,-0.863865,	-5.642065	,-0.156894	,0.159776	]]).reshape(1, -1)

         # 3. Apply scaler to all 19 features
        # scaled_full_input = scaler.transform(full_input_array)

        # 4. Keep only the first 5 scaled features for KMeans
        # reduced_scaled_input = scaled_full_input[:, :5]

        print(f"patient data : {full_input_array}")
        # 5. Predict cluster
        prediction = kmeans.predict(full_input_array)[0]

        return f'Predicted Cluster: {prediction}'

    except Exception as e:
        return f'Error: {str(e)}'

    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
