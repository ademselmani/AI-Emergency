import React, { useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Eye, EyeOff } from "lucide-react";

const VoiceToTextButton = ({ onTranscript }) => {
  const { transcript, resetTranscript } = useSpeechRecognition();

  const handleMouseDown = () => {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true });
  };

  const handleMouseUp = () => {
    SpeechRecognition.stopListening();
    onTranscript(transcript);
  };

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return null;
  }

  return (
    <button
      type="button"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      className="btn btn-outline-secondary"
    >
      🎤
    </button>
  );
};

const Register = () => {
  const fileInputRef = useRef();
  const [formData, setFormData] = useState({
    name: "",
    familyName: "",
    gender: "",
    role: "",
    email: "",
    phone: "",
    password: "",
    cin: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your submit logic and validation here
  };

  return (
    <div className="authentication-wrapper authentication-basic container-p-y">
      <div className="authentication-inner">
        <div className="card">
          <div className="card-body">
            <h4 className="text-center mb-4 fw-bold">Create an Employee</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="cin" className="form-label">
                  CIN <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className={`form-control ${errors.cin ? "is-invalid" : ""}`}
                    name="cin"
                    id="cin"
                    placeholder="Enter CIN"
                    value={formData.cin}
                    onChange={handleChange}
                  />
                  <VoiceToTextButton
                    onTranscript={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        cin: text.replace(/\s/g, ""),
                      }))
                    }
                  />
                </div>
                {errors.cin && (
                  <div className="invalid-feedback">{errors.cin}</div>
                )}
              </div>

              {/* First Name */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  First Name <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    id="name"
                    name="name"
                    placeholder="Enter your first name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <VoiceToTextButton
                    onTranscript={(text) =>
                      setFormData((prev) => ({ ...prev, name: text }))
                    }
                  />
                </div>
                {errors.name && (
                  <div className="invalid-feedback">{errors.name}</div>
                )}
              </div>

              {/* Last Name */}
              <div className="mb-3">
                <label htmlFor="familyName" className="form-label">
                  Last Name <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className={`form-control ${
                      errors.familyName ? "is-invalid" : ""
                    }`}
                    id="familyName"
                    name="familyName"
                    placeholder="Enter your last name"
                    value={formData.familyName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <VoiceToTextButton
                    onTranscript={(text) =>
                      setFormData((prev) => ({ ...prev, familyName: text }))
                    }
                  />
                </div>
                {errors.familyName && (
                  <div className="invalid-feedback">{errors.familyName}</div>
                )}
              </div>

              {/* Gender */}
              <div className="mb-3">
                <label htmlFor="gender" className="form-label">
                  Gender <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-control ${
                    errors.gender ? "is-invalid" : ""
                  }`}
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select gender</option>
                  <option value="Man">Man</option>
                  <option value="Woman">Woman</option>
                </select>
                {errors.gender && (
                  <div className="invalid-feedback">{errors.gender}</div>
                )}
              </div>

              {/* Role */}
              <div className="mb-3">
                <label htmlFor="role" className="form-label">
                  Role <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-control ${errors.role ? "is-invalid" : ""}`}
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select role</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                  <option value="nurse">Nurse</option>
                  <option value="triage_nurse">Triage Nurse</option>
                  <option value="receptionnist">Receptionist</option>
                  <option value="ambulance_driver">Ambulance Driver</option>
                </select>
                {errors.role && (
                  <div className="invalid-feedback">{errors.role}</div>
                )}
              </div>

              {/* Email */}
              {/* Email */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-2">
                  <input
                    type="email"
                    className={`form-control ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <VoiceToTextButton
                    onTranscript={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        email: text
                          .replace(" at ", "@")
                          .replace(" dot ", ".")
                          .replace(/\s/g, ""),
                      }))
                    }
                  />
                </div>
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                  Phone <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className={`form-control ${
                      errors.phone ? "is-invalid" : ""
                    }`}
                    id="phone"
                    name="phone"
                    placeholder="Enter phone with country code (e.g., +123456789)"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <VoiceToTextButton
                    onTranscript={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: text.replace(/\s/g, ""),
                      }))
                    }
                  />
                </div>
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>

              <div className="mb-3 form-password-toggle">
                <label className="form-label" htmlFor="registerPassword">
                  Password <span className="text-danger">*</span>
                </label>
                <div className="input-group input-group-merge d-flex gap-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    id="registerPassword"
                    className={`form-control ${
                      errors.password ? "is-invalid" : ""
                    }`}
                    name="password"
                    placeholder="Enter your password (min 8 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <VoiceToTextButton
                    onTranscript={(text) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: text.replace(/\s/g, ""),
                      }))
                    }
                  />
                </div>
                {errors.password && (
                  <div className="invalid-feedback d-block">
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="mb-3">
                <label htmlFor="image" className="form-label">
                  Upload Image <span className="text-danger">*</span>
                </label>
                <input
                  type="file"
                  className={`form-control ${errors.image ? "is-invalid" : ""}`}
                  ref={fileInputRef}
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                />
                {errors.image && (
                  <div className="invalid-feedback">{errors.image}</div>
                )}
              </div>

              {/* Preview */}
              {previewImage && (
                <div className="mb-3 text-center">
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

              {/* Submit */}
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Processing..." : "Sign up"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
