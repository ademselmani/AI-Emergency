import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Réinitialise l'erreur avant chaque tentative de connexion

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { email, password }
      );

      // Si la connexion est réussie, on enregistre le token et redirige l'utilisateur
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("user_id", response.data.userId);
        if (response.data.role === "admin") navigate("/dashboard");
        else navigate("/showPatients");
      } else {
        setError("Une erreur inconnue est survenue");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Erreur lors de la connexion");
      } else {
        setError("Impossible de se connecter au serveur");
      }
    }
  };

  const handleFaceRecognitionClick = () => {
    navigate("/face-recognition"); // Naviguer vers la page de reconnaissance faciale
  };

  return (
    <div className="authentication-wrapper authentication-basic container-p-y">
      <div className="authentication-inner">
        <div className="card">
          <div className="card-body">
            <h4 className="mb-2">Welcome to ResUrgence! 👋</h4>

            {error && <p className="text-danger">{error}</p>}

            <form id="formAuthentication" className="mb-3" onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="email"
                  name="email-username"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="mb-3 form-password-toggle">
                <div className="d-flex justify-content-between">
                  <label className="form-label" htmlFor="password">
                    Password
                  </label>
                  <a href="forget-password">
                    <small>Forgot Password?</small>
                  </a>
                </div>
                <div className="input-group input-group-merge">
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    name="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-3">
                <button
                  type="button"
                  className="btn btn-secondary w-100"
                  onClick={handleFaceRecognitionClick}
                >
                  Use Face Recognition
                </button>
              </div>
              <div className="mb-3">
                <button className="btn btn-primary d-grid w-100" type="submit">
                  Sign in
                </button>
              </div>
            </form>

            <p className="text-center">
              <span>New on our platform?</span>
              <a href="register">
                <span>Create an account</span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
