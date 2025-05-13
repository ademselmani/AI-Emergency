from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np

app = Flask(__name__)
CORS(app)

# Charge les modèles
pipeline = joblib.load("../python/triage_full_pipeline (3).joblib")
kmeans = joblib.load('../python/kmeans_model.pkl')
scaler = joblib.load('../python/scaler.pkl')
decision_tree_model = joblib.load("../python/decision_tree_model.pkl")

# Moyennes & écarts-types pour la normalisation
MEANS = {
    'age': 47.647910,
    'PainGrade': 1.434690,
    'Source': 1.677613,
    'BlooddpressurSystol': 110.744596,
    'O2Saturation': 95.796707
}

STDS = {
    'age': 22.240436,
    'PainGrade': 1.660787,
    'Source': 0.467739,
    'BlooddpressurSystol': 4.745882,
    'O2Saturation': 1.272364
}

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    required = ['age','PainGrade','Source','BlooddpressurSystol','O2Saturation']
    missing = [k for k in required if k not in data]
    if missing:
        return jsonify({"error": f"Champs manquants : {missing}"}), 400

    # Normalisation manuelle
    data_norm = {
        feat: (data[feat] - MEANS[feat]) / STDS[feat]
        for feat in MEANS
    }

    # Construction du DataFrame
    df_norm = pd.DataFrame([{
        'age': data_norm['age'],
        'PainGrade': data_norm['PainGrade'],
        'Source': data_norm['Source'],
        'BlooddpressurSystol': data_norm['BlooddpressurSystol'],
        'O2Saturation': data_norm['O2Saturation']
    }])

    try:
        pred = pipeline.predict(df_norm)[0]
        return jsonify({"triage_grade": int(pred)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/cluster', methods=['POST'])
def cluster():
    try:
        data = request.get_json()
        required = ['age','PainGrade','Source','BlooddpressurSystol','O2Saturation']
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Champs manquants : {missing}"}), 400

        # Normalisation
        data_norm = {
            feat: (data[feat] - MEANS[feat]) / STDS[feat]
            for feat in MEANS
        }

        # Conversion en array numpy
        input_features = np.array([
            data_norm['age'],
            data_norm['PainGrade'],
            data_norm['Source'],
            data_norm['BlooddpressurSystol'],
            data_norm['O2Saturation']
        ]).reshape(1, -1)

        # Prédiction du cluster
        cluster = kmeans.predict(input_features)[0]
        distances = kmeans.transform(input_features).tolist()[0]

        return jsonify({
            "cluster": int(cluster),
            "distances": distances,
            "normalized_features": data_norm
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500




# Charge le modèle de régression
regression_model = joblib.load('../python/decision_tree_model.pkl')

@app.route('/predict_los', methods=['POST'])
def predict_los():
    try:
        data = request.get_json()
        required = ['age','PainGrade','Source','BlooddpressurSystol','O2Saturation']
        missing = [k for k in required if k not in data]
        if missing:
            return jsonify({"error": f"Champs manquants : {missing}"}), 400

        data_norm = {
            feat: (data[feat] - MEANS[feat]) / STDS[feat]
            for feat in MEANS
        }

        df = pd.DataFrame([data_norm])

        los_pred = regression_model.predict(df)[0]
        return jsonify({"length_of_stay": float(round(los_pred, 2))}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

      

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)