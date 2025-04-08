import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/employee/finduser/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setCurrentUser(response.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error loading user data.");
      }
    };

    fetchData();
  }, [token, userId]);

  const getRoleDescription = (role) => {
    switch (role) {
      case "nurse": return "Nurse 🏥";
      case "admin": return "Administrator 🔧";
      case "doctor": return "Doctor 🩺";
      case "receptionnist": return "Receptionist 👨‍💻";
      case "triage_nurse": return "Triage Nurse 👩‍⚕️";
      default: return "Unknown role";
    }
  };

  return (
    <div style={styles.container}>
      {currentUser ? (
        <div style={styles.card}>
          {currentUser.image && (
            <img 
              src={currentUser.image} 
              alt="Profile" 
              style={styles.profileImage} 
            />
          )}
          <h2>{currentUser.name} {currentUser.familyName} </h2>
          <h2>{getRoleDescription(currentUser.role)}</h2>
          <div style={styles.infoContainer}>
            
            <div style={styles.infoRow}><span style={styles.label}>Email:</span> <span>{currentUser.email}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>Phone:</span> <span>{currentUser.phone}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>Birthday:</span> <span>{new Date(currentUser.birthday).toLocaleDateString()}</span></div>
            <div style={styles.infoRow}><span style={styles.label}>Gender:</span> <span>{currentUser.gender}</span></div>
          </div>
        </div>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : (
        <p>Loading user information...</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginTop: '50px',
    display: 'flex',
    justifyContent: 'center',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    padding: '30px',
    borderRadius: '10px',
    backgroundColor: '#fff',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    width: '500px',
    textAlign: 'center',
  },
  profileImage: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '20px',
  },
  infoContainer: {
    marginTop: '20px',
    textAlign: 'left',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  error: {
    color: 'red',
  },
};

export default Profile;
