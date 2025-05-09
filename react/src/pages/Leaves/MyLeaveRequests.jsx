import { useEffect, useState } from "react";
import axios from "axios";
import LeaveRequestForm from "./LeaveRequestForm";

const MyLeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: "'Segoe UI', Arial, sans-serif"
    },
    header: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    title: {
      fontSize: '24px',
      color: '#2d3748',
      margin: '0 0 20px 0'
    },
    grid: {
      display: 'grid',
      gap: '20px',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
    },
    card: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '15px'
    },
    statusBadge: {
      padding: '5px 15px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500'
    },
    datesContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '15px',
      marginBottom: '15px'
    },
    dateItem: {
      background: '#f8fafc',
      padding: '10px',
      borderRadius: '8px'
    },
    label: {
      fontSize: '12px',
      color: '#718096',
      display: 'block',
      marginBottom: '5px'
    },
    error: {
      background: '#fed7d7',
      color: '#822727',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px'
    },
    newButton: {
      background: '#ff3b3f',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      ':hover': {
        background: '#ff3b3f'
      }
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      padding: '20px',
      width: '90%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto'
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/leaves/my-requests", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setRequests(response.data);
    } catch (error) {
      setError(error.response?.data?.error || "Error loading requests");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    const statusColors = {
      approved: { background: '#c6f6d5', color: '#22543d' },
      pending: { background: '#fefcbf', color: '#744210' },
      rejected: { background: '#fed7d7', color: '#822727' }
    };
    return statusColors[status] || { background: '#ff3b3f', color: '#ff3b3f' };
  };

  const handleNewRequestSuccess = () => {
    setShowForm(false);
    fetchMyRequests();
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={styles.title}>My Leave Requests</h2>
          <button 
            style={styles.newButton}
            onClick={() => setShowForm(true)}
          >
            + New Request
          </button>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          <p>{error}</p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div 
          style={styles.modalOverlay}
          onClick={() => setShowForm(false)}
        >
          <div 
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <LeaveRequestForm 
              onSuccess={handleNewRequestSuccess}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      <div style={styles.grid}>
        {requests.length > 0 ? (
          requests.map((request) => (
            <div 
              key={request._id}
              style={styles.card}
            >
              <div style={styles.cardHeader}>
                <h3 style={{ 
                  fontSize: '18px',
                  color: '#1a365d',
                  margin: 0,
                  textTransform: 'capitalize'
                }}>
                  {request.leaveType}
                </h3>
                <span style={{
                  ...styles.statusBadge,
                  ...getStatusStyle(request.status)
                }}>
                  {request.status}
                </span>
              </div>

              <div>
                <div style={styles.datesContainer}>
                  <div style={styles.dateItem}>
                    <span style={styles.label}>Start</span>
                    <p style={{ margin: 0, fontWeight: '500' }}>
                      {new Date(request.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={styles.dateItem}>
                    <span style={styles.label}>End</span>
                    <p style={{ margin: 0, fontWeight: '500' }}>
                      {new Date(request.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <span style={styles.label}>Reason</span>
                  <p style={{ margin: '5px 0 0 0' }}>
                    {request.reason || "-"}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ 
            textAlign: 'center',
            padding: '40px',
            gridColumn: '1 / -1'
          }}>
            <p style={{ color: '#718096' }}>No leave requests found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLeaveRequests;