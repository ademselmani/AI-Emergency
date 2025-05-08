import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import "chart.js/auto";
import "./Stats.css";

const Statleaves = () => {
  const [currentLeaves, setCurrentLeaves] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

        {/* Menu déroulant */}
        <select
          className="navigation-select"
          onChange={(e) => {
            if (e.target.value) navigate(e.target.value);
          }}
          style={{
            backgroundColor: 'white',
            color: '#ff3b3f',
            padding: '0.6rem 1.2rem 0.6rem 0.8rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            appearance: 'none',
            outline: 'none',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease',
            minWidth: '120px',
            fontWeight: '500',
            paddingRight: '2rem' // Pour faire de la place pour l'icône
          }}
        >
          <option value="">View</option>
          <option value="/leaves">all leaves</option>
          <option value="/anomalies">Anomalies</option>
          <option value="/forecast">Forecast</option>
        </select>
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
