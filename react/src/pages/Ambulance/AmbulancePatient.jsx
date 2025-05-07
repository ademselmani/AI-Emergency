import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import io from "socket.io-client";
import { FaAmbulance, FaUser, FaMapMarkerAlt, FaPhone, FaCheckCircle } from "react-icons/fa";

const socket = io("http://localhost:3000");

const patientIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3059/3059518.png',
  iconSize: [32, 32],
});

const ambulanceIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2098/2098314.png',
  iconSize: [40, 40],
});

const LocationMarker = ({ setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return null;
};

const AmbulancePatient = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    position: null
  });
  const [ambulancePosition, setAmbulancePosition] = useState(null);
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false);
  const [errors, setErrors] = useState({});
  const [eta, setEta] = useState("calculating...");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData(prev => ({
        ...prev,
        position: [pos.coords.latitude, pos.coords.longitude]
      }));
    });
    
    socket.on("ambulancePosition", (data) => {
      setAmbulancePosition([data.lat, data.lng]);
      // Simuler un calcul d'ETA
      const minutes = Math.floor(Math.random() * 5) + 3;
      setEta(`${minutes} min`);
    });

    return () => socket.off("ambulancePosition");
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone.match(/^\+216[0-9]{8}$/)) newErrors.phone = "Invalid phone number";
    if (!formData.position) newErrors.position = "Location is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await fetch("http://localhost:3000/api/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          position: { 
            lat: formData.position[0], 
            lng: formData.position[1] 
          }
        }),
      });
      setDemandeEnvoyee(true);
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  return (
    <div className="ambulance-container">
      <div className="ambulance-header">
        <FaAmbulance className="header-icon" />
        <h2>Emergency Ambulance Request</h2>
      </div>
      
      {!demandeEnvoyee ? (
        <form onSubmit={handleSubmit} className="ambulance-form">
          <div className="form-group">
            <label>
              <FaUser className="input-icon" /> Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className={errors.name ? "error" : ""}
              placeholder="Enter full name"
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaPhone className="input-icon" /> Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className={errors.phone ? "error" : ""}
              placeholder="8 digits (e.g. 12345678)"
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>
              <FaMapMarkerAlt className="input-icon" /> Location
              <span className="instruction"> (Click on the map to set your location)</span>
            </label>
            <div className="map-wrapper">
              <MapContainer 
                center={formData.position || [36.895, 10.1885]} 
                zoom={15} 
                style={{ height: "300px", width: "100%", borderRadius: "8px" }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                
                <LocationMarker setPosition={(pos) => 
                  setFormData({...formData, position: pos})} 
                />

                {formData.position && (
                  <Marker position={formData.position} icon={patientIcon}>
                    <Popup>Your location</Popup>
                  </Marker>
                )}
              </MapContainer>
              {errors.position && <span className="error-message">{errors.position}</span>}
            </div>
          </div>

          <button type="submit" className="submit-button">
            <FaAmbulance className="button-icon" /> Request Ambulance
          </button>
        </form>
      ) : (
        <div className="status-container">
          <div className="success-message">
            <FaCheckCircle className="success-icon" />
            <h3>Ambulance Request Sent Successfully!</h3>
            <p>Help is on the way. Please stay where you are.</p>
          </div>

          

          <div className="map-container">
            <MapContainer 
              center={formData.position} 
              zoom={15} 
              style={{ height: "400px", width: "100%", borderRadius: "8px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {formData.position && (
                <Marker position={formData.position} icon={patientIcon}>
                  <Popup>Your location</Popup>
                </Marker>
              )}

              {ambulancePosition && (
                <Marker position={ambulancePosition} icon={ambulanceIcon}>
                  <Popup>Ambulance - ETA: {eta}</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
      )}

      <style jsx>{`
        .ambulance-container {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .ambulance-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          color: #ff3b3f;
        }

        .header-icon {
          font-size: 2rem;
        }

        .ambulance-header h2 {
          font-size: 1.8rem;
          margin: 0;
        }

        .ambulance-form {
          background: #f8f9fa;
          padding: 2rem;
          border-radius: 12px;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #2d2d2d;
        }

        .input-icon {
          color: #ff3b3f;
        }

        .instruction {
          font-weight: normal;
          font-size: 0.9rem;
          color: #666;
        }

        input {
          width: 100%;
          padding: 0.8rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border 0.3s;
        }

        input:focus {
          outline: none;
          border-color: #ff3b3f;
        }

        input.error {
          border-color: #e74c3c;
        }

        .error-message {
          color: #e74c3c;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: block;
        }

        .map-wrapper {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          transition: border 0.3s;
        }

        .map-wrapper:hover {
          border-color: #ff3b3f;
        }

        .submit-button {
          width: 100%;
          padding: 1rem;
          background: #ff3b3f;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-button:hover {
          background: #e23337;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 59, 63, 0.2);
        }

        .button-icon {
          font-size: 1.2rem;
        }

        .status-container {
          text-align: center;
        }

        .success-message {
          background: #f0fff4;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid #c6f6d5;
        }

        .success-icon {
          font-size: 3rem;
          color: #48bb78;
          margin-bottom: 1rem;
        }

        .success-message h3 {
          color: #2d2d2d;
          margin-bottom: 0.5rem;
        }

        .success-message p {
          color: #666;
          margin: 0;
        }

        .tracking-info {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .info-card {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        }

        .info-card h4 {
          color: #2d2d2d;
          margin-top: 0;
          margin-bottom: 0.5rem;
        }

        .info-card p {
          color: #666;
          margin: 0;
        }

        .eta {
          font-size: 1.5rem;
          font-weight: bold;
          color: #ff3b3f;
        }

        .map-container {
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .ambulance-container {
            padding: 1.5rem;
          }
          
          .tracking-info {
            grid-template-columns: 1fr;
          }
          
          .ambulance-header h2 {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .ambulance-container {
            padding: 1rem;
          }
          
          .ambulance-form {
            padding: 1.5rem;
          }
          
          .instruction {
            display: block;
            margin-top: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AmbulancePatient;