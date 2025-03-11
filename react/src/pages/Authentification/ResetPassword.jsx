import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

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
      setMessage(response.data.message || "Votre mot de passe a été réinitialisé avec succès");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue lors de la réinitialisation du mot de passe");
    }
  };

  return (
    <div className="authentication-wrapper authentication-basic container-p-y">
      <div className="authentication-inner">
        <div className="card">
          <div className="card-body">
            <h4 className="mb-2">
            Password reset</h4>
            <p className="mb-4">Please enter your new password.</p>
            {error && <p className="text-danger">{error}</p>}
            {message && <p className="text-success">{message}</p>}
            <form className="mb-3" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">New password </label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  placeholder="Entrez votre nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <button className="btn btn-primary d-grid w-100" type="submit">
                  Reset password 
                </button>
              </div>
            </form>
            <p className="text-center">
              <a href="/login">Return to login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
