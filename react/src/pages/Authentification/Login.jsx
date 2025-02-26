import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Google Login
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  // Handle regular login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Reset error before each login attempt

    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        { email, password }
      );

      // If login is successful, save the token and redirect the user
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role);
        localStorage.setItem("user_id", response.data.userId);
        if (response.data.role === "admin") navigate("/dashboard");
        else navigate("/showPatients");
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
    navigate("/face-recognition"); // Navigate to the face recognition page
  };

  // Handle Google OAuth callback
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const email = queryParams.get("email");
    const error = queryParams.get("error");

    if (error) {
      setError(error); // Display error message if any
    }

    if (token && email) {
      // Save the token and user data to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("email", email);

      // Fetch user role or additional details if needed
      axios
        .get("http://localhost:3000/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const role = response.data.role;
          localStorage.setItem("role", role);

          // Redirect the user based on their role
          if (role === "admin") navigate("/dashboard");
          else navigate("/showPatients");
        })
        .catch((err) => {
          setError("Failed to fetch user details");
        });
    }
  }, [location, navigate]);

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
              <div className="d-flex justify-content-center">
                <div className="col-3">
                  <div className="mb-3">
                    <button className="btn btn-primary d-grid w-100" type="submit">
                      Sign in
                    </button>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-center">
                <div className="col-3 text-center">
                  <div className="mb-3">
                    <button
                      type="button"
                      className="btn btn-secondary w-100"
                      onClick={handleFaceRecognitionClick}
                    >
                      Use Face Recognition
                    </button>
                  </div>
                </div>
              </div>
              <div className="d-flex justify-content-center">
                <div className="col-3">
                  <div className="mb-3">
                    <button
                      className="btn btn-danger d-grid w-100"
                      type="button"
                      onClick={handleGoogleLogin}
                    >
                      Sign in With GOOGLE
                    </button>
                  </div>
                </div>
              </div>
            </form>

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
