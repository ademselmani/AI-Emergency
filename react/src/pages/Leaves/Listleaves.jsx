import { useEffect, useState } from "react";
import axios from "axios";
import "./LeavesList.css";

const Listleaves = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchRequests = async () => {
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
          setError(data.error || "Erreur lors du chargement des demandes.");
        }
      } catch (err) {
        setError("Erreur serveur, veuillez réessayer.");
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
      } else {
        alert(data.error || "Erreur lors de la mise à jour.");
      }
    } catch (error) {
      alert("Erreur serveur, veuillez réessayer.");
    }
  };

  const deleteRequest = async (id) => {
    const url = `http://localhost:3000/api/leaves/${id}`;
    
    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setRequests(requests.filter((req) => req._id !== id));
      } else {
        alert(data.error || "Erreur lors de la suppression.");
      }
    } catch (error) {
      alert("Erreur serveur, veuillez réessayer.");
    }
  };

  const filteredRequests = filterStatus === "all"
    ? requests
    : requests.filter((req) => req.status === filterStatus);

  const getStatusCount = (status) => requests.filter(r => r.status === status).length;
  return (
    <div className="listleaves-container">
      <div className="listleaves-header">
        <h2 className="listleaves-title">Leaves </h2>
        
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

      {error && (
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
                  <h3 className="employee-name">{request.employee?.name || "Non spécifié"}</h3>
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
                    >
                      <span className="icon-check"></span>
                      Approve
                    </button>
                    <button
                      onClick={() => updateRequestStatus(request._id, "reject")}
                      className="action-button reject-button"
                    >
                      <span className="icon-cross"></span>
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => deleteRequest(request._id)}
                  className="action-button delete-button"
                >
                  <span className="icon-trash"></span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-requests">
            <p>Aucune demande trouvée</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listleaves;