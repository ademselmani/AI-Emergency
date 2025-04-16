import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";


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

  const resetToken = ()  => {
    localStorage.setItem("role","");
    localStorage.setItem("user_id","");
    localStorage.setItem("token","");
  }

  return (
    <div className="authentication-wrapper authentication-basic container-p-y">
      <div className="authentication-inner">
        <div className="card">
          <div className="card-body">
            <h4 className="mb-2">Password reset</h4>
            <p className="mb-4">
            Enter your code</p>
            {error && <p className="text-danger">{error}</p>}
            {message && <p className="text-success">{message}</p>}

            <form className="mb-3" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Code
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="number"
                  placeholder="Enter your email"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <button className="btn btn-primary d-grid w-100" type="submit">
                Submit
                </button>
              </div>
            </form>

            <p onClick={resetToken} className="text-center">
              <a href="/login">
              Return to login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationCode;