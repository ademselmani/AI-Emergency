


# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(__name__)
CORS(app)

# Charge ton pipeline tel quel (scaler + knn)
pipeline = joblib.load("../python/triage_full_pipeline (3).joblib")

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
