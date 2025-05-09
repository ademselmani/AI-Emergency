
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaGoogle, FaUserCircle, FaLock } from "react-icons/fa"; // Icônes pour les boutons

// —--------------------------------------------------
// Configuration Axios globale
axios.defaults.baseURL = "http://localhost:3000";
const savedToken = localStorage.getItem("token");
if (savedToken) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}
// —--------------------------------------------------

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Google Login
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  // Handle regular login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("/api/auth/login", { email, password });

      if (response.data.token) {
        // 1. Stocker le token et infos user
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("user_id", response.data.userId);

       await axios.post("http://localhost:3000/api/auth/verifyCode", { email });
        navigate("/verify", { state: { email: email } });  
        //navigate("/profile");



      } else {
        setError("An unknown error occurred");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Login failed");
      } else {
        setError("Unable to connect to the server");
      }
    }
  };

  // Handle face recognition login
  const handleFaceRecognitionClick = () => {
    navigate("/face-recognition");
  };

  // Handle Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const emailFromOAuth = params.get("email");
    const errorFromOAuth = params.get("error");

    if (errorFromOAuth) {
      setError(errorFromOAuth);
    }

    if (token && emailFromOAuth) {
      // 1. Stocker token et email
      localStorage.setItem("token", token);
      localStorage.setItem("email", emailFromOAuth);

      // 2. Configurer Axios
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 3. Récupérer le rôle et rediriger
      axios
        .get("/api/auth/user")
        .then((res) => {
          const role = res.data.role;
          localStorage.setItem("role", role);
          if (role === "admin") navigate("/dashboard");
          else navigate("/profile");
        })
        .catch(() => {
          setError("Failed to fetch user details");
        });
    }
  }, [location, navigate]);

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: `url('/Hospital2.gif')`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div
        className="login-card"
        style={{
          backdropFilter: "blur(10px)",
          background: "rgba(255, 255, 255, 0.2)",
        }}
      >
        <h2 className="login-title">Welcome to RescueOn!</h2>
        <p className="login-subtitle">Please sign in to continue</p>

        {error && <p className="error-message">{error}</p>}
        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FaUserCircle className="icon" /> Email
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FaLock className="icon" /> Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" style={{ backgroundColor: '#ff3b3f' }}>
                Sign in
          </button>


          <div className="alternative-login">
            <button
              type="button"
              className="face-recognition-button"
              onClick={handleFaceRecognitionClick}
            >
              Use Face Recognition
            </button>

            <button
              type="button"
              className="google-login-button"
              onClick={handleGoogleLogin}
            >
              <FaGoogle className="google-icon" /> Sign in with Google
            </button>
          </div>

          <div className="forget-password">
            <a href="/forget-password">Forgot Password?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles CSS injectés automatiquement
const styles = `
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f2f5;
    padding: 20px;
  }

  .login-card {
    background: #fff;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
    text-align: center;
  }

  .login-title {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .login-subtitle {
    font-size: 1rem;
    color: #666;
    margin-bottom: 2rem;
  }

  .error-message {
    color: #ff4d4f;
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
    text-align: left;
  }

  .form-label {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
    color: #555;
    margin-bottom: 0.5rem;
  }

  .icon {
    margin-right: 0.5rem;
    font-size: 1.2rem;
  }

  .form-input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
  }

  .form-input:focus {
    border-color: #007bff;
    outline: none;
  }

  .login-button {
    width: 100%;
    padding: 0.75rem;
    background-color:  #ff3b3f;
    color: #fff;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .login-button:hover {
    background-color:rgb(179, 0, 27);
  }

  .alternative-login {
    margin-top: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .face-recognition-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #28a745;
    color: #fff;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .face-recognition-button:hover {
    background-color: #218838;
  }

  .google-login-button {
    width: 100%;
    padding: 0.75rem;
    background-color:rgb(13, 165, 225);
    color: #fff;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background-color 0.3s ease;
  }

  .google-login-button:hover {
    background-color:rgb(40, 156, 214);
  }

  .google-icon {
    font-size: 1.2rem;
  }

  .forgot-password {
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  .forgot-password a {
    color: #007bff;
    text-decoration: none;
  }

  .forgot-password a:hover {
    text-decoration: underline;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default Login;
