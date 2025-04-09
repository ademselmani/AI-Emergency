import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    familyName: "",
    gender: "",
    email: "",
    role: "",
    phone: "",
    password: "",
    image: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData({ ...formData, image: file });
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      video.onplaying = () => {
        setTimeout(() => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob((blob) => {
            if (blob) {
              setFormData({ ...formData, image: blob });
              setPreviewImage(URL.createObjectURL(blob));
            }
          });

          stream.getTracks().forEach((track) => track.stop());
        }, 1000);
      };
    } catch (error) {
      console.error("Error accessing camera: ", error);
      setError("Unable to access the camera.");
    }
  };

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
              <a href="#" className="app-brand-link gap-2">
                <span className="app-brand-text demo text-body fw-bolder">
                  Create an employee
                </span>
              </a>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="familyName" className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="familyName"
                  name="familyName"
                  value={formData.familyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="gender" className="form-label">Gender</label>
                <select
                  className="form-control"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a gender</option>
                  <option value="man">Man</option>
                  <option value="woman">Woman</option>
                </select>
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
                  <option value="triage_nurse">Triage Nurse</option>
                  <option value="receptionnist">Receptionnist</option>
                  <option value="ambulance_driver">Ambulance Driver</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Phone</label>
                <input
                  type="text"
                  className="form-control"
                  id="phone"
                  name="phone"
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

              <div className="mb-3">
                <label htmlFor="image" className="form-label">Upload Image</label>
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              {/* Affichage de l’image capturée ou uploadée */}
              {previewImage && (
                <div className="mb-3 text-center">
                  <p className="text-success">✅ Image sélectionnée</p>
                  <img
                    src={previewImage}
                    alt="Preview"
                    style={{
                      maxWidth: "200px",
                      borderRadius: "8px",
                      border: "2px solid #198754",
                    }}
                  />
                </div>
              )}

              {/* Capture avec caméra */}
              <div className="mb-3">
                <button type="button" className="btn btn-secondary" onClick={handleCapture}>
                  Capture Photo
                </button>
              </div>

              <div className="mb-3 form-check">
                <input className="form-check-input" type="checkbox" id="terms" />
                <label className="form-check-label" htmlFor="terms">
                  I agree to <a href="#">privacy policy & terms</a>
                </label>
              </div>

              <button type="submit" className="btn btn-primary d-grid w-100">
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
