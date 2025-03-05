import { useEffect, useState } from "react";

const MyLeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/leaves/my-requests", {
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

    fetchMyRequests();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4">Mes demandes de congé</h2>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Type</th>
            <th className="border p-2">Début</th>
            <th className="border p-2">Fin</th>
            <th className="border p-2">Statut</th>
            <th className="border p-2">Reason</th>
          </tr>
        </thead>
        <tbody>
          {requests.length > 0 ? (
            requests.map((request) => (
              <tr key={request._id} className="text-center">
                <td className="border p-2 capitalize">{request.leaveType}</td>
                <td className="border p-2">{new Date(request.startDate).toLocaleDateString()}</td>
                <td className="border p-2">{new Date(request.endDate).toLocaleDateString()}</td>
                <td className={`border p-2 ${request.status === "approved" ? "text-green-600" : request.status === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
                  {request.status}</td>
                <td className="border p-2 capitalize">{request.reason}</td>
                
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="border p-4 text-center text-gray-500">Aucune demande trouvée.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MyLeaveRequests;
