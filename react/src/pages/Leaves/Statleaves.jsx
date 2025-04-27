import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { Link } from "react-router-dom";
import "chart.js/auto";
import "./Stats.css";

const Statleaves = () => {
  const [currentLeaves, setCurrentLeaves] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Options du graphique améliorées
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: { 
          color: '#2d3748',
          font: { size: 12 }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Number of Leaves',
          color: '#4a5568',
          font: { size: 14 }
        },
        beginAtZero: true,
        grid: { 
          color: 'rgba(0,0,0,0.05)' 
        },
        ticks: {
          stepSize: 1,
          precision: 0,
          color: '#4a5568',
          font: { size: 12 },
          callback: (value) => Number.isInteger(value) ? value : ''
        }
      },
      x: {
        title: {
          display: true,
          text: 'Roles',
          color: '#4a5568',
          font: { size: 14 }
        },
        grid: { 
          display: false 
        },
        ticks: { 
          color: '#4a5568',
          font: { size: 12 } 
        }
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/leaves/current-leaves-by-role",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            }
          }
        );

        if (response.status === 200) {
          setCurrentLeaves(response.data);
        }
      } catch (error) {
        setError("Error loading data");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: currentLeaves.map(stat => stat._id),
    datasets: [{
      label: "Current Leaves",
      backgroundColor: "#f0c5d6",
      borderRadius: 4,
      data: currentLeaves.map(stat => stat.count),
    }]
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="stats-container">
      <div className="header-container">
        <h1 className="title">Leave Statistics</h1>
        <Link 
          to="/leaves" 
          className="view-all-button"
          style={{
            backgroundColor: '#f5f5f9',
            color: '#03c3ec',
            padding: '0.5rem 1rem',
            border: '1px solid #03c3ec',
            borderRadius: '6px',
            borderColor:'#03c3ec',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'background-color 0.2s'
          }}
        >
          View all leaves
        </Link>
        <Link 
          to="/forecast" 
          className="view-all-button"
          style={{
            backgroundColor: '#f5f5f9',
            color: '#03c3ec',
            padding: '0.5rem 1rem',
            border: '1px solid #03c3ec',
            borderRadius: '6px',
            borderColor:'#03c3ec',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'background-color 0.2s'
          }}
        >
           Leave Forecast
        </Link>
        <Link 
          to="/anomalies" 
          className="view-all-button"
          style={{
            backgroundColor: '#f5f5f9',
            color: '#03c3ec',
            padding: '0.5rem 1rem',
            border: '1px solid #03c3ec',
            borderRadius: '6px',
            borderColor:'#03c3ec',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'background-color 0.2s'
          }}
        >
          Anomaly Leaves
        </Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}

      <div className="charts-wrapper">
        {currentLeaves.length > 0 && (
          <div className="chart-card">
            <div className="chart-header">
              <h2>Current Leaves by Role ({new Date().toLocaleDateString()})</h2>
            </div>
            
            <div className="chart-wrapper">
              <Bar
                data={chartData}
                options={chartOptions}
              />
            </div>

            <div className="leaves-list">
              {currentLeaves.map(role => (
                <div key={role._id} className="role-group">
                  <h3>{role._id} ({role.count})</h3>
                  <ul>
                    {role.employees.map((employee, index) => (
                      <li key={index}>
                        {employee.name} - 
                        {new Date(employee.startDate).toLocaleDateString()} to 
                        {new Date(employee.endDate).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statleaves;