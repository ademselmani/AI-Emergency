import React, { useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { Eye, EyeOff, Mic, Camera } from "lucide-react";
import axios from "axios";

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
      className="voice-btn"
    >
      <Mic size={18} />
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
  const [message, setMessage] = useState('');
  const [activeSection, setActiveSection] = useState('personal');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleVoiceInput = (field) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
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
            const imageUrl = URL.createObjectURL(blob);
            setPreviewImage(imageUrl);
            setFormData((prev) => ({
              ...prev,
              image: blob,
            }));
          });

          stream.getTracks().forEach((track) => track.stop());
        }, 1000);
      };
    } catch (error) {
      console.error("Error accessing camera: ", error);
      setErrors({ general: "Unable to access the camera." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    for (const key in formData) {
      formDataToSend.append(key, formData[key]);
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3000/api/auth/signup", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 201) {
        setMessage('Employee created successfully!');
        setFormData({
          name: "",
          familyName: "",
          gender: "",
          role: "",
          email: "",
          phone: "",
          password: "",
          cin: "",
          image: null
        });
        setPreviewImage(null);
      }
    } catch (err) {
      setMessage(`Error: ${err.response?.data?.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-form-container">
      <div className="form-card">
        <div className="form-header">
          <h2>Create Employee Account</h2>
          <p className="form-subtitle">Fill in the details to register a new employee</p>
        </div>
        
        {message && (
          <div className={`message-alert ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="form-navigation">
          <button 
            className={`nav-btn ${activeSection === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveSection('personal')}
          >
            Personal Info
          </button>
          <button 
            className={`nav-btn ${activeSection === 'professional' ? 'active' : ''}`}
            onClick={() => setActiveSection('professional')}
          >
            Professional Info
          </button>
          <button 
            className={`nav-btn ${activeSection === 'credentials' ? 'active' : ''}`}
            onClick={() => setActiveSection('credentials')}
          >
            Credentials
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Personal Information Section */}
          <div className={`form-section ${activeSection === 'personal' ? 'active' : ''}`}>
            <h3 className="section-title">Personal Information</h3>
            <div className="form-grid">
              {/* CIN */}
              <div className="input-group">
                <label htmlFor="cin">CIN <span className="required">*</span></label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="cin"
                    name="cin"
                    value={formData.cin}
                    onChange={handleChange}
                    required
                    placeholder="Enter CIN"
                  />
                  <VoiceToTextButton onTranscript={handleVoiceInput("cin")} />
                </div>
              </div>

              {/* Name */}
              <div className="input-group">
                <label htmlFor="name">First Name <span className="required">*</span></label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter first name"
                  />
                  <VoiceToTextButton onTranscript={handleVoiceInput("name")} />
                </div>
              </div>

              {/* Family Name */}
              <div className="input-group">
                <label htmlFor="familyName">Last Name <span className="required">*</span></label>
                <div className="input-with-icon">
                  <input
                    type="text"
                    id="familyName"
                    name="familyName"
                    value={formData.familyName}
                    onChange={handleChange}
                    required
                    placeholder="Enter last name"
                  />
                  <VoiceToTextButton onTranscript={handleVoiceInput("familyName")} />
                </div>
              </div>

              {/* Gender */}
              <div className="input-group">
                <label>Gender <span className="required">*</span></label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select 
                  </option>
                  <option value="Man">Male</option>
                  <option value="Woman">Female</option>
                </select>
              </div>

              {/* Phone */}
              <div className="input-group">
                <label htmlFor="phone">Phone</label>
                <div className="input-with-icon">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (___) ___-____"
                  />
                  <VoiceToTextButton onTranscript={handleVoiceInput("phone")} />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information Section */}
          <div className={`form-section ${activeSection === 'professional' ? 'active' : ''}`}>
            <h3 className="section-title">Professional Information</h3>
            <div className="form-grid">
              {/* Role */}
              <div className="input-group">
                <label>Role <span className="required">*</span></label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="triage_nurse">Triage Nurse</option>
                  <option value="receptionnist">Receptionist</option>
                  <option value="ambulance_driver">Ambulance Driver</option>
                </select>
              </div>

              {/* Email */}
              <div className="input-group">
                <label htmlFor="email">Email <span className="required">*</span></label>
                <div className="input-with-icon">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="email@example.com"
                  />
                  <VoiceToTextButton onTranscript={handleVoiceInput("email")} />
                </div>
              </div>

              {/* Image Upload */}
              <div className="input-group full-width">
                <label>Profile Image</label>
                <div className="image-upload-options">
                  <div className="upload-option">
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="upload-btn"
                    >
                      Choose File
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleCapture}
                    className="upload-btn"
                  >
                    <Camera size={16} /> Take Photo
                  </button>
                </div>
                
                {previewImage && (
                  <div className="image-preview">
                    <div className="preview-container">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="preview-image"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData(prev => ({ ...prev, image: null }));
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="remove-image-btn"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Credentials Section */}
          <div className={`form-section ${activeSection === 'credentials' ? 'active' : ''}`}>
            <h3 className="section-title">Account Credentials</h3>
            <div className="form-grid">
              {/* Password */}
              <div className="input-group">
                <label htmlFor="password">Password <span className="required">*</span></label>
                <div className="input-with-icon">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modern-form-container {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          max-width: 1000px;
          margin: 2rem auto;
          padding: 0 1rem;
        }

        .form-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          padding: 2rem;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eaeaea;
        }

        .form-header h2 {
          color: #2c3e50;
          margin: 0;
          font-size: 1.8rem;
        }

        .form-subtitle {
          color: #7f8c8d;
          margin: 0.5rem 0 0;
          font-size: 0.9rem;
        }

        .form-navigation {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 1rem;
        }

        .nav-btn {
          background: none;
          border: none;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: #7f8c8d;
          transition: all 0.3s ease;
        }

        .nav-btn:hover {
          background: #f5f7fa;
          color: #ff3b3f;
        }

        .nav-btn.active {
          background: #ff3b3f;
          color: white;
        }

        .form-section {
          display: none;
          animation: fadeIn 0.3s ease;
        }

        .form-section.active {
          display: block;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-title {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
          position: relative;
          padding-bottom: 0.5rem;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background: #ff3b3f;
          border-radius: 3px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .input-group {
          margin-bottom: 1rem;
        }

        .input-group.full-width {
          grid-column: 1 / -1;
        }

        .input-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #34495e;
          font-size: 0.9rem;
        }

        .required {
          color: #e74c3c;
        }

        .input-group input,
        .input-group select,
        .input-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: border 0.3s ease;
        }

        .input-group input:focus,
        .input-group select:focus,
        .input-group textarea:focus {
          outline: none;
          border-color: #ff3b3f;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }

        .input-with-icon {
          position: relative;
        }

        .voice-btn {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #7f8c8d;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .voice-btn:hover {
          color: #ff3b3f;
        }

        .toggle-password {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #7f8c8d;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .toggle-password:hover {
          color: #ff3b3f;
        }

        .image-upload-options {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .upload-btn {
          background: white;
          border: 1px solid #ddd;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .upload-btn:hover {
          background: #f5f7fa;
          border-color: #ff3b3f;
          color: #ff3b3f;
        }

      .preview-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
}

.remove-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: #ff3b3f;
  border: none;
  border-radius: 50%;
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-image-btn:hover {
  transform: scale(1.1);
  background: #ff1a1f;
}

.form-actions {
  margin-top: 2rem;
  border-top: 1px solid #eaeaea;
  padding-top: 1.5rem;
  text-align: right;
}

.submit-btn {
  background: #ff3b3f;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.submit-btn:hover {
  background: #ff1a1f;
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(255, 59, 63, 0.3);
}

.submit-btn:disabled {
  background: #ff999b;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.message-alert {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
  font-size: 0.9rem;
}

.message-alert.success {
  background: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #a5d6a7;
}

.message-alert.error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef9a9a;
}

/* Responsive Design */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-navigation {
    flex-direction: column;
  }

  .nav-btn {
    width: 100%;
    text-align: center;
  }

  .image-upload-options {
    flex-direction: column;
  }

  .upload-btn {
    justify-content: center;
  }

  .preview-image {
    width: 100%;
    height: auto;
  }
}

@media (max-width: 480px) {
  .form-card {
    padding: 1rem;
  }

  .form-header h2 {
    font-size: 1.5rem;
  }

  .submit-btn {
    width: 100%;
    justify-content: center;
  }
     `}</style>
    </div>
  );
}
export default Register;