import { useEffect, useState } from "react";
import "./Listleaves.css";

const Listleaves = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Liste des demandes de congé</h2>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Employee</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Reason</th>
            <th className="border p-2">Start</th>
            <th className="border p-2">End</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length > 0 ? (
            requests.map((request) => (
              <tr key={request._id} className="text-center">
                <td className="border p-2">{request.employee?.name || "N/A"}</td>
                <td className="border p-2">{request.employee?.email || "N/A"}</td>
                <td className="border p-2 capitalize">{request.leaveType}</td>
                <td className="border p-2 capitalize">{request.reason}</td>
                <td className="border p-2">{new Date(request.startDate).toLocaleDateString()}</td>
                <td className="border p-2">{new Date(request.endDate).toLocaleDateString()}</td>
                <td className={`border p-2 font-bold ${request.status === "approved" ? "text-green-600" : request.status === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
                  {request.status}
                </td>
                <td className="border p-2 flex justify-center gap-2">
                  {request.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateRequestStatus(request._id, "approve")}
                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                      >
                        <i className="fas fa-check-circle" style={{ color: "green" }}></i>
                      </button>
                      <button
                        onClick={() => updateRequestStatus(request._id, "reject")}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                      >
                        <i className="fas fa-times-circle" style={{ color: "red" }}></i>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteRequest(request._id)}
                    className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
                  >
                    <i className="fas fa-trash" style={{ color: "gray" }}></i>
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="border p-4 text-center text-gray-500">Aucune demande trouvée.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Listleaves;
