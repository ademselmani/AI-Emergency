import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Réinitialise l'erreur avant chaque tentative de connexion

    try {
      const response = await axios.post("http://localhost:3000/api/auth/login", {
        email,
        password,
      });

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
      setError(err.response?.data?.message || "Impossible de se connecter au serveur");
    }
  };

  const handleFaceRecognitionClick = () => {
    navigate("/face-recognition");
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
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="text"
                  className="form-control"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {/* Password Field */}
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <label htmlFor="password" className="form-label">Password</label>
                  <a href="/forget-password"><small>Forgot Password?</small></a>
                </div>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
              <span>New on our platform? </span>
              <a href="/register"><span>Create an account</span></a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
