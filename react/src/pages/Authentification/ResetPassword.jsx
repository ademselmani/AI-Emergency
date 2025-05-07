import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { FaLock, FaLockOpen } from "react-icons/fa";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const response = await axios.post("http://localhost:3000/api/auth/reset-password", {
        token,
        newPassword,
      });
      setMessage(response.data.message || "Password reset successfully");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Error resetting password");
    }
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
        <h2 className="login-title">Reset Password</h2>
        <p className="login-subtitle">Enter your new password below</p>

        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">
              <FaLock className="icon" /> New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className="form-input"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">
            <FaLockOpen className="button-icon" /> Reset Password
          </button>

          <div className="forgot-password">
            <p className="text-center">
              <a href="/login">Return to login</a>
            </p>
          </div>
        </form>
      </div>
      <style>{styles}</style>
    </div>
  );
};

// Styles cohérents avec les autres composants
const styles = `
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
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
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
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

  .button-icon {
    font-size: 1.2rem;
  }
`;

export default ResetPassword;