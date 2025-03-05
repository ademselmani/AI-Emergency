import React, { useState, useEffect } from "react";
import axios from "axios";

const Statleaves = () => {
  // State pour stocker les statistiques des congés
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });

  // State pour gérer l'erreur
  const [error, setError] = useState("");

  useEffect(() => {
    // Fonction pour récupérer les statistiques des congés depuis l'API
    const fetchLeaveStats = async () => {
      try {
        // Effectuer une requête GET pour récupérer les statistiques des congés
        const response = await axios.get("http://localhost:3000/api/leaves/stat", {
          headers: {
            "Authorization": "Bearer YOUR_TOKEN_HERE" // Remplacez par votre token JWT
          }
        });

        // Transformation des données reçues et mise à jour du state
        const statsData = response.data;
        const updatedStats = {
          pending: statsData.find(stat => stat._id === "pending")?.count || 0,
          approved: statsData.find(stat => stat._id === "approved")?.count || 0,
          rejected: statsData.find(stat => stat._id === "rejected")?.count || 0
        };
        setStats(updatedStats); // Mise à jour de l'état avec les nouvelles données
      } catch (error) {
        setError("Une erreur s'est produite lors du chargement des statistiques.");
      }
    };

    // Appel de la fonction au montage du composant
    fetchLeaveStats();
  }, []); // La fonction est appelée une seule fois, au montage du composant

  // Styles en ligne
  const styles = {
    container: {
      padding: "20px",
      backgroundColor: "#f4f4f4",
      borderRadius: "8px",
      width: "50%",
      margin: "auto",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
    },
    header: {
      textAlign: "center",
      color: "#333",
      marginBottom: "20px"
    },
    error: {
      color: "red",
      textAlign: "center",
      fontSize: "16px",
      marginBottom: "20px"
    },
    list: {
      listStyleType: "none",
      paddingLeft: "0"
    },
    listItem: {
      fontSize: "18px",
      margin: "10px 0",
      padding: "10px",
      backgroundColor: "#fff",
      borderRadius: "5px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      display: "flex",
      alignItems: "center"
    },
    icon: {
      marginRight: "10px",
      fontSize: '18px',
    },
    approvedIcon: {
      color: 'green', // Green for approved
    },
    rejectedIcon: {
      color: 'red', // Red for rejected
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Leaves Statistics</h1>
      {error && <p style={styles.error}>{error}</p>}
      <div>
        <h3>Leaves status</h3>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <i className="fas fa-clock" style={styles.icon}></i>
            <strong>Pending:</strong> {stats.pending}
          </li>
          <li style={styles.listItem}>
          <i className="fas fa-check-circle" style={{ ...styles.icon, ...styles.approvedIcon }}></i>
            <strong>Approved:</strong> {stats.approved}
          </li>
          <li style={styles.listItem}>
          <i className="fas fa-times-circle" style={{ ...styles.icon, ...styles.rejectedIcon }}></i>
            <strong>Rejected:</strong> {stats.rejected}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Statleaves;
