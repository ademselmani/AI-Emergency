import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Pour effectuer des requêtes HTTP
import "./FaceRecognition.css"; // Ajouter le fichier CSS pour les styles

const FaceRecognition = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [hasError, setHasError] = useState(false); // Gérer les erreurs d'accès à la caméra
  const [loading, setLoading] = useState(false); // Gérer l'état de chargement

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
      } catch (error) {
        setHasError(true);
        console.error("Erreur d'accès à la caméra", error);
      }
    };

    startVideo();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);
  const captureAndLogin = async () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg");

    try {
      setLoading(true); // Indiquer que la requête est en cours

      // Envoi de l'image au backend pour la reconnaissance faciale
      const response = await axios.post(
        "http://localhost:3000/api/auth/loginface",
        { imageData }
      ); // Vérifie que l'URL est correcte

      // Si la reconnaissance faciale réussie, rediriger vers le dashboard
      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("user_id", response.data.userId);
        if (response.data.role === "admin") navigate("/dashboard");
        else navigate("/showPatients");
      } else {
        alert("Reconnaissance faciale échouée.");
      }
    } catch (error) {
      console.error(
        "Erreur lors de la connexion via reconnaissance faciale:",
        error
      );
      alert("Erreur lors de la connexion.");
    } finally {
      setLoading(false); // Revenir à l'état normal
    }
  };

  return (
    <div className="face-recognition-container">
      <h2>Reconnaissance Faciale</h2>
      {hasError ? (
        <div className="error-message">
          <p>Erreur d'accès à la caméra. Veuillez vérifier vos paramètres.</p>
        </div>
      ) : (
        <div className="camera-container">
          <video ref={videoRef} autoPlay muted className="video" />
          <canvas
            ref={canvasRef}
            width="320"
            height="240"
            style={{ display: "none" }}
          />
        </div>
      )}
      <button
        className="capture-button"
        onClick={captureAndLogin}
        disabled={loading}
      >
        {loading ? "Chargement..." : "Se connecter"}
      </button>
    </div>
  );
};

export default FaceRecognition;
