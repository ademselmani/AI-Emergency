import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiMail, FiPhone, FiCalendar, FiUser, FiUsers } from 'react-icons/fi';
import { FaClinicMedical, FaUserCog, FaUserMd, FaUserTie, FaUserNurse } from 'react-icons/fa';

const Profile = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("user_id");

  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, userId]);

  const getRoleDetails = (role) => {
    const roleData = {
      nurse: { 
        icon: <FaUserNurse size={18} />, 
        color: '#4CAF50',
        title: 'Nurse'
      },
      admin: { 
        icon: <FaUserCog size={18} />, 
        color: '#F44336',
        title: 'Administrator'
      },
      doctor: { 
        icon: <FaUserMd size={18} />, 
        color: '#2196F3',
        title: 'Doctor'
      },
      receptionnist: { 
        icon: <FaUserTie size={18} />, 
        color: '#FF9800',
        title: 'Receptionist'
      },
      triage_nurse: { 
        icon: <FaClinicMedical size={18} />, 
        color: '#9C27B0',
        title: 'Triage Nurse'
      },
    };
    
    return roleData[role] || { 
      icon: <FiUser size={18} />, 
      color: '#607D8B',
      title: role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')
    };
  };

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorCard}>
          <div style={styles.errorIcon}>⚠️</div>
          <h3 style={styles.errorTitle}>Profile Error</h3>
          <p style={styles.errorText}>{error}</p>
          <button 
            style={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  const roleDetails = getRoleDetails(currentUser.role);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
      
      
        <div >
          <div  className='m-5' style={styles.avatarContainer}

          >
            {currentUser.image ? (
              <img 
                src={currentUser.image} 
                alt="Profile" 
                style={styles.profileImage} 
              />
            ) : (
              <div>
                {currentUser.name.charAt(0)}{currentUser.familyName.charAt(0)}
              </div>
            )}
          </div>
          
          <h1 style={styles.name}>{currentUser.name} {currentUser.familyName}</h1>
          
          <div style={{
            ...styles.roleBadge,
            backgroundColor: `${roleDetails.color}20`,
            color: roleDetails.color
          }}>
            {roleDetails.icon}
            <span style={{ marginLeft: 10 }}>{roleDetails.title}</span>
          </div>
        </div>
        
        {/* Profile Details */}
        <div style={styles.detailsContainer}>
          <div style={styles.detailsSection}>
            <h3 style={styles.sectionTitle}>
              <FiUser style={{ marginRight: 10 }} />
              Personal Information
            </h3>
            
            <div style={styles.infoGrid}>
              <InfoItem 
                icon={<FiUser size={18} />}
                label="First Name"
                value={currentUser.name}
              />
              <InfoItem 
                icon={<FiUsers size={18} />}
                label="Family Name"
                value={currentUser.familyName}
              />
              <InfoItem 
                icon={<FiMail size={18} />}
                label="Email"
                value={currentUser.email}
              />
              <InfoItem 
                icon={<FiPhone size={18} />}
                label="Phone"
                value={currentUser.phone || 'Not provided'}
              />
              <InfoItem 
                icon={<FiCalendar size={18} />}
                label="Birthday"
                value={currentUser.birthday ? new Date(currentUser.birthday).toLocaleDateString() : 'Not provided'}
              />
              <InfoItem 
                icon={currentUser.gender === 'male' ? '♂' : currentUser.gender === 'female' ? '♀' : '⚧'}
                label="Gender"
                value={currentUser.gender ? currentUser.gender.charAt(0).toUpperCase() + currentUser.gender.slice(1) : 'Not specified'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for info items
const InfoItem = ({ icon, label, value }) => (
  <div style={styles.infoItem}>
    <div style={styles.infoIcon}>{icon}</div>
    <div style={styles.infoContent}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  </div>
);

// Helper function to darken color
const darkenColor = (color, percent) => {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) - amt;
  const G = (num >> 8 & 0x00FF) - amt;
  const B = (num & 0x0000FF) - amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1)}`;
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: '#f8fafc',
  },
  card: {
    width: '100%',
    maxWidth: '800px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.12)'
    }
  },
  profileHeader: {
    padding: '50px 30px 30px',
    textAlign: 'center',
    color: 'white',
    position: 'relative',
  },
  avatarContainer: {
    
    marginBottom: '20px',
  },
  profileImage: {

    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
  },
  profilePlaceholder: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '0 auto',
    border: '4px solid rgba(255, 255, 255, 0.3)',
  },
  name: {
    margin: '0',
    fontSize: '28px',
    fontWeight: '700',
    color: 'white',
    letterSpacing: '0.5px',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 20px',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '15px',
    marginTop: '15px',
    backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  detailsContainer: {
    padding: '30px',
  },
  detailsSection: {
    marginBottom: '25px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '1px solid #f0f0f0',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '15px',
    borderRadius: '12px',
    backgroundColor: '#f9fafb',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#f1f5f9',
      transform: 'translateY(-2px)'
    }
  },
  infoIcon: {
    marginRight: '15px',
    color: '#64748b',
    fontSize: '20px',
    marginTop: '2px',
  },
  infoContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  infoLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '16px',
    color: '#1e293b',
    fontWeight: '600',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    gap: '20px',
    backgroundColor: '#f8fafc',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f1f5f9',
    borderTop: '5px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '16px',
    fontWeight: '500',
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    padding: '20px',
    backgroundColor: '#f8fafc',
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '450px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
  },
  errorIcon: {
    fontSize: '48px',
    color: '#ef4444',
    marginBottom: '15px',
  },
  errorTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '10px',
  },
  errorText: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '20px',
    lineHeight: '1.5',
  },
  retryButton: {
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#4f46e5',
      transform: 'translateY(-2px)'
    }
  },
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  }
};

export default Profile;