import { useState, useEffect } from "react";
import axios from "axios";

const LeaveRequestForm = ({ onSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    leaveType: "",
  });

  const [message, setMessage] = useState({ text: "", type: "" });
  const [errors, setErrors] = useState({});
  const [existingLeaves, setExistingLeaves] = useState([]);

  // Charger les congés existants de l'utilisateur
  useEffect(() => {
    const fetchUserLeaves = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/leaves/my-requests",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setExistingLeaves(response.data);
      } catch (error) {
        console.error("Error fetching user leaves:", error);
      }
    };

    fetchUserLeaves();
  }, []);

  const validateDates = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];
    
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    } else if (formData.startDate < today) {
      newErrors.startDate = "Start date cannot be in the past";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (formData.endDate < formData.startDate) {
      newErrors.endDate = "End date cannot be before start date";
    }

    // Vérification des chevauchements avec les congés existants
    const newStart = new Date(formData.startDate);
    const newEnd = new Date(formData.endDate);
    
    const hasOverlap = existingLeaves.some(leave => {
      const existingStart = new Date(leave.startDate);
      const existingEnd = new Date(leave.endDate);
      
      return (
        (newStart >= existingStart && newStart <= existingEnd) ||
        (newEnd >= existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    if (hasOverlap) {
      newErrors.startDate = "You already have a leave during this period";
      newErrors.endDate = "You already have a leave during this period";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({...errors, [e.target.name]: ""});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateDates()) return;
  
    setMessage({ text: "", type: "" });
  
    try {
      const response = await axios.post(
        "http://localhost:3000/api/leaves/request",
        {
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
  
      if (response.status === 201) {
        setMessage({
          text: "Leave request submitted successfully! 🎉",
          type: "success"
        });
  
        setTimeout(() => {
          onSuccess();
          setFormData({ startDate: "", endDate: "", reason: "", leaveType: "" });
        }, 1000);
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.error || "Submission failed 😢",
        type: "error"
      });
    }
  };

  const getMinEndDate = () => {
    return formData.startDate || new Date().toISOString().split('T')[0];
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px' }}>✈️ New Leave Request</h2>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '24px',
            color: '#666',
            padding: '5px'
          }}
        >
          ×
        </button>
      </div>

      {message.text && (
        <div style={{ 
          padding: '10px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: message.type === "success" ? '#e8f5e9' : '#ffebee',
          color: message.type === "success" ? '#2e7d32' : '#c62828'
        }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: errors.startDate ? '2px solid #f44336' : '1px solid #ddd'
            }}
          />
          {errors.startDate && <span style={{ color: '#f44336', fontSize: '14px' }}>{errors.startDate}</span>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            min={getMinEndDate()}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: errors.endDate ? '2px solid #f44336' : '1px solid #ddd'
            }}
          />
          {errors.endDate && <span style={{ color: '#f44336', fontSize: '14px' }}>{errors.endDate}</span>}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Leave Type</label>
          <select
            name="leaveType"
            value={formData.leaveType}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="">Select leave type...</option>
            <option value="sick">🏥 Sick Leave</option>
            <option value="vacation">🌴 Vacation</option>
            <option value="personal">👤 Personal Leave</option>
            <option value="maternity">👶 Maternity Leave</option>
            <option value="other">❓ Other</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>Reason</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows="4"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
            placeholder="Please provide details for your request..."
          />
        </div>

        <button
          type="submit"
          style={{
            background: '#ff3b3f',
            color: 'white',
            padding: '12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default LeaveRequestForm;