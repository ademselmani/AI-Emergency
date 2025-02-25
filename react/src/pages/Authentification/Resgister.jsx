import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react"; // Utilisation d'icônes Lucide (tu peux aussi utiliser FontAwesome ou Material Icons)

const Register = () => {
  // State variables to store form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    password: "",
    image: null, // State for image upload
  });
  const [showPassword, setShowPassword] = useState(false);

  // State variables for error handling
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0], // Store the selected file
    });
  };

  // Handle camera capture
  const handleCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      // Wait until the video is playing
      video.onplaying = () => {
        setTimeout(() => {
          // Set the canvas size based on video dimensions
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          // Draw the current frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert canvas to image blob
          canvas.toBlob((blob) => {
            setFormData({
              ...formData,
              image: blob, // Set the image as a blob
            });
          });

          stream.getTracks().forEach((track) => track.stop()); // Stop video stream
        }, 1000); // Capture image after 1 second
      };
    } catch (error) {
      console.error("Error accessing camera: ", error);
      setError("Unable to access the camera.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      const response = await axios.post("http://localhost:3000/api/auth/signup", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 201) {
        alert("User created successfully!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="authentication-wrapper authentication-basic container-p-y">
      <div className="authentication-inner">
        <div className="card">
          <div className="card-body">
            <div className="app-brand justify-content-center">
              <a href="index.html" className="app-brand-link gap-2">
                <span className="app-brand-logo demo"></span>
                <span className="app-brand-text demo text-body fw-bolder">Create employee</span>
              </a>
            </div>
           

            {error && <div className="alert alert-danger">{error}</div>}

            <form id="formAuthentication" className="mb-3" onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  placeholder="Enter your username"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  className="form-control"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a role</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                  <option value="nurse">Nurse</option>
                  <option value="triage_nurse">Triage-nurse</option>
                  <option value="receptionnist">Receptionnist</option>
                  <option value="ambulance_driver">Ambulance_driver</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  id="phone"
                  name="phone"
                  placeholder="Enter your phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
             <div className="mb-3 form-password-toggle">
  <label className="form-label" htmlFor="password">Password</label>
  <div className="input-group input-group-merge">
    <input
      type={showPassword ? "text" : "password"}
      id="password"
      className="form-control"
      name="password"
      placeholder="Enter your password"
      value={formData.password}
      onChange={handleChange}
      required
    />
    <button
      type="button"
      className="btn btn-outline-secondary"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
</div>


              {/* Image Upload Field */}
              <div className="mb-3">
                <label htmlFor="image" className="form-label">Upload Image</label>
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  name="image"
                  onChange={handleImageChange}
                />
              </div>

              {/* Camera Capture Button */}
              <div className="mb-3">
                <button type="button" className="btn btn-secondary" onClick={handleCapture}>
                  Capture Photo
                </button>
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="terms-conditions"
                    name="terms"
                  />
                  <label className="form-check-label" htmlFor="terms-conditions">
                    I agree to
                    <a href="javascript:void(0);">privacy policy & terms</a>
                  </label>
                </div>
              </div>
              <button className="btn btn-primary d-grid w-100" type="submit">
                Sign up
              </button>
            </form>

         
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
