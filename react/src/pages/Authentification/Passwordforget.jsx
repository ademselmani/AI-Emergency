import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PasswordForget = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await axios.post("http://localhost:3000/api/auth/forget-password", { email });
      setMessage(response.data.message);
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Erreur lors de l'envoi de l'e-mail");
      } else {
        setError("Impossible de contacter le serveur");
      }
    }
  };

  return (
    <div className="authentication-wrapper authentication-basic container-p-y">
      <div className="authentication-inner">
        <div className="card">
          <div className="card-body">
            <h4 className="mb-2">Password reset</h4>
            <p className="mb-4">
            Enter your email address and we will send you a reset link.</p>
            {error && <p className="text-danger">{error}</p>}
            {message && <p className="text-success">{message}</p>}

            <form className="mb-3" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <button className="btn btn-primary d-grid w-100" type="submit">
                Send reset link
                </button>
              </div>
            </form>

            <p className="text-center">
              <a href="/login">
              Return to login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordForget;