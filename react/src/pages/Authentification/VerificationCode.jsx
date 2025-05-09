import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaLock } from "react-icons/fa"; // Icône pour le champ du code

const VerificationCode = () => {
  const [code, setCode] = useState("");
  const location = useLocation();
  const { email } = location.state || {}; 
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await axios.post("http://localhost:3000/api/auth/codeVerified", { email , code });
      setMessage(response.data.message);
      const role = localStorage.getItem("role");
      if (role === "admin") navigate("/dashboard");
      else navigate("/profile");
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Code incorrect");
      } else {
        setError("Impossible de contacter le serveur");
      }
    }
  };

  const resetToken = () => {
    localStorage.setItem("role", "");
    localStorage.setItem("user_id", "");
    localStorage.setItem("token", "");
  };

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
        <h2 className="login-title">Enter your Verification Code</h2>
        <p className="login-subtitle">Please enter the code sent to your email</p>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code" className="form-label">
              <FaLock className="icon" /> Code
            </label>
            <input
              type="text"
              id="code"
              className="form-input"
              placeholder="Enter your code"
              value={code}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setCode(value);  // Accepter uniquement les chiffres
                }
              }}              required
            />
          </div>

          <button type="submit" className="login-button" style={{ backgroundColor: '#ff3b3f' }}>
  Submit
</button>


          <div className="forgot-password">
            <p onClick={resetToken} className="text-center">
              <a href="/login">Return to login</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles CSS (ajoutés pour correspondre à la page de connexion)
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

  .success-message {
    color: #28a745;
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
    background-color: #ff3b3f;
    color: #fff;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .login-button:hover {
    background-color: #0056b3;
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

// Injecter les styles dans le document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default VerificationCode;
