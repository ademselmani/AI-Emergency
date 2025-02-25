import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const ResetPassword = () => {
  const { token } = useParams(); // Extract the token from the URL
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handle form submission for resetting the password
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3000/api/auth/reset-password", {
        token,
        newPassword,
      });

      setSuccess(true);
      setError("");
      navigate("/login")
    } catch (err) {
      setError("Something went wrong! Please try again.");
      setSuccess(false);
    }
  };

  return (
    <div>
      <h2>Reset Your Password</h2>
      {success ? (
        <div>Password reset successful! You can now login with your new password.</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Reset Password</button>
        </form>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};

export default ResetPassword;
