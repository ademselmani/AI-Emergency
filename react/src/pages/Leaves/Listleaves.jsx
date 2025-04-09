import { useEffect, useState } from "react";
import axios from "axios";
import "./LeavesList.css";
import { toast } from 'react-toastify'; // For better notifications
import 'react-toastify/dist/ReactToastify.css';

const Listleaves = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3000/api/leaves/requests", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setRequests(data);
        } else {
          setError(data.error || "Error loading leave requests.");
          toast.error(data.error || "Error loading leave requests.");
        }
      } catch (err) {
        setError("Server error, please try again.");
        toast.error("Server error, please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const updateRequestStatus = async (id, status) => {
    const url = `http://localhost:3000/api/leaves/${status}/${id}`;
    
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setRequests(requests.map((req) => (req._id === id ? { ...req, status } : req)));
        
        // Show success notification with email confirmation
        if (status === "approve") {
          toast.success(
            <div>
              <p>Leave approved successfully!</p>
              <p>Notification email sent to employee.</p>
            </div>,
            { autoClose: 3000 }
          );
        } else {
          toast.success("Leave request updated successfully!", { autoClose: 2000 });
        }
      } else {
        toast.error(data.error || "Error updating request.");
      }
    } catch (error) {
      toast.error("Server error, please try again.");
      console.error("Update error:", error);
    }
  };

  const deleteRequest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/leaves/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setRequests(requests.filter((req) => req._id !== id));
        toast.success("Leave request deleted successfully!");
      } else {
        toast.error(data.error || "Error deleting request.");
      }
    } catch (error) {
      toast.error("Server error, please try again.");
      console.error("Delete error:", error);
    }
  };

  const filteredRequests = filterStatus === "all"
    ? requests
    : requests.filter((req) => req.status === filterStatus);

  const getStatusCount = (status) => requests.filter(r => r.status === status).length;

  return (
    <div className="listleaves-container">
      <div className="listleaves-header">
        <h2 className="listleaves-title">Leave Requests</h2>
        
        <div className="filter-buttons">
          <button
            className={`filter-button ${filterStatus === "all" ? "active-all" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All ({requests.length})
          </button>
          <button
            className={`filter-button ${filterStatus === "pending" ? "active-pending" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending ({getStatusCount("pending")})
          </button>
          <button
            className={`filter-button ${filterStatus === "approved" ? "active-approved" : ""}`}
            onClick={() => setFilterStatus("approved")}
          >
            Approved ({getStatusCount("approved")})
          </button>
          <button
            className={`filter-button ${filterStatus === "rejected" ? "active-rejected" : ""}`}
            onClick={() => setFilterStatus("rejected")}
          >
            Rejected ({getStatusCount("rejected")})
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="loading-indicator">
          <p>Loading leave requests...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="leaves-grid">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div key={request._id} className="leave-card">
              <div className="card-header">
                <div className="employee-info">
                  <h3 className="employee-name">{request.employee?.name || "Not specified"}</h3>
                  <p className="employee-email">{request.employee?.email || "N/A"}</p>
                </div>
                <span className={`status-badge status-${request.status}`}>
                  {request.status}
                </span>
              </div>

              <div className="card-content">
                <div className="leave-info">
                  <label>Type of leave</label>
                  <p className="leave-type">{request.leaveType}</p>
                </div>
                
                <div className="leave-info">
                  <label>Reason</label>
                  <p className="leave-reason">{request.reason || "-"}</p>
                </div>

                <div className="dates-container">
                  <div className="date-item">
                    <label>Start</label>
                    <p className="date-value">{new Date(request.startDate).toLocaleDateString()}</p>
                  </div>
                  <div className="date-item">
                    <label>End</label>
                    <p className="date-value">{new Date(request.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                {request.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateRequestStatus(request._id, "approve")}
                      className="action-button approve-button"
                      title="Approve leave request"
                    >
                      <span className="icon-check"></span>
                      Approve
                    </button>
                    <button
                      onClick={() => updateRequestStatus(request._id, "reject")}
                      className="action-button reject-button"
                      title="Reject leave request"
                    >
                      <span className="icon-cross"></span>
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteRequest(request._id)}
                  className="action-button delete-button"
                  title="Delete leave request"
                >
                  <span className="icon-trash"></span>
                </button>
              </div>
            </div>
          ))
        ) : (
          !isLoading && (
            <div className="no-requests">
              <p>No leave requests found</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Listleaves;