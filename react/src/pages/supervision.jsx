import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SupervisionAnomalies = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/treatments/anomalies');
        if (!response.ok) throw new Error('Erreur de réseau');
        const data = await response.json();
        
        const formattedData = data.map(item => {
          const startDate = new Date(item.startDate);
          const endDate = new Date(item.endDate);
          const duration = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
          
          return {
            id: item._id, 
            category: item.category,
            patientId: item.patient?._id || null,
            patientName: item.patient ? `${item.patient.firstName} ${item.patient.lastName}` : 'Non assigné',
            status: item.status ? 'Actif' : 'Terminé',
            details: item.details,
            startDate: startDate.toLocaleDateString('fr-FR'),
            endDate: endDate.toLocaleDateString('fr-FR'),
            duration: duration,
            isAnomaly: true, // Comme c'est l'endpoint anomalies, on suppose que tous sont des anomalies
            rawDate: startDate,
            treatedBy: item.treatedBy.length > 0 
              ? item.treatedBy.map(p => `${p.name} (${p.role})`).join(', ') 
              : 'Non assigné',
            equipmentCount: item.equipment.length
          };
        });
        
        formattedData.sort((a, b) => a.rawDate - b.rawDate);
        setChartData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnomalies();
  }, []);

  if (loading) return (
    <div className="loading-container" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#fff7f7'
    }}>
      <div className="spinner" style={{
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #e56b6b',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <p>{error}</p>
    </div>
  );

  return (
    <div className="supervision-anomalies">
      <header className="dashboard-header">
        <h1>Vigilance Médicale</h1>
        <p>Tableau de bord de gestion des anomalies de traitement</p>
      </header>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Anomalies détectées</h3>
          <p>{chartData.length}</p>
        </div>
        <div className="metric-card">
          <h3>Durée moyenne</h3>
          <p>{chartData.length > 0 ? Math.round(chartData.reduce((a,b) => a + b.duration, 0) / chartData.length) : 0} jours</p>
        </div>
        <div className="metric-card">
          <h3>Dernière détection</h3>
          <p>{chartData.length > 0 ? chartData[chartData.length - 1].startDate : '--/--/----'}</p>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <h2>Évolution des anomalies</h2>
          <div className="chart-legend">
            <span className="legend-dot"></span>
            <span>Durée anormale</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#fbd5d5" />
            <XAxis 
              dataKey="startDate" 
              tick={{ fill: '#9b6a6c' }}
              axisLine={{ stroke: '#e5a5a5' }}
            />
            <YAxis 
              tick={{ fill: '#9b6a6c' }}
              axisLine={{ stroke: '#e5a5a5' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff7f7',
                borderColor: '#f5b8b8',
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value} jours`, 'Durée']}
              labelFormatter={(date) => `Date: ${date}`}
            />
            <Line 
              type="monotone" 
              dataKey="duration" 
              stroke="#e56b6b"
              strokeWidth={3}
              dot={{ r: 5, fill: '#e56b6b', strokeWidth: 2 }}
              activeDot={{ r: 8, fill: '#d14f4f' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="anomalies-table">
        <div className="table-header">
          <h2>Détail des anomalies</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Catégorie</th>
                <th>Patient</th>
                <th>Date début</th>
                <th>Date Détection/fin</th>
                <th>Durée</th>
                <th>Statut</th>
                <th>Équipements</th>
                <th>Traîté par</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item) => (
                <tr key={item.id}>
                  <td>#{item.id.slice(-6)}</td>
                  <td>
                    <span className={`category-badge ${item.category.toLowerCase()}`}>
                      {item.category}
                    </span>
                  </td>
                  <td>{item.patientName}</td>
                  <td>{item.startDate}</td>
                  <td>{item.endDate}</td>
                  <td>
                    <span className="duration-value">
                      {item.duration} <span className="duration-unit">jours</span>
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${item.status === 'Actif' ? 'active' : 'inactive'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.equipmentCount}</td>
                  <td>{item.treatedBy}</td>
                  <td>
                    {item.patientId && (
                        <NavLink 
                         to={`/medical-treatments/patient/show/${item.patient}`}
                         state={{ patient: item.patient }} 
                       > 
                         <i className="fa-solid fa-eye ccc"></i>
                       </NavLink>
                     )}
                    <button 
                      className="details-btn"
                      title="Voir détails"
                      onClick={() => alert(`Détails: ${item.details}`)}
                    >
                      <i className="fa-solid fa-info-circle"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          min-height: 100vh;
          background-color: #fff9f9;
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .dashboard-header {
          margin-bottom: 2rem;
        }
        
        .dashboard-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #7a4a4c;
          margin-bottom: 0.5rem;
        }
        
        .dashboard-header p {
          color: #9b6a6c;
          font-size: 1rem;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        @media (min-width: 1024px) {
          .metrics-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        .metric-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #e56b6b;
        }
        
        .metric-card h3 {
          color: #9b6a6c;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        
        .metric-card p {
          color: #7a4a4c;
          font-size: 1.875rem;
          font-weight: 700;
        }
        
        .chart-container {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }
        
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .chart-header h2 {
          color: #7a4a4c;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .chart-legend {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .legend-dot {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          background-color: #e56b6b;
        }
        
        .anomalies-table {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .table-header {
          padding: 1.5rem 1.5rem 0;
        }
        
        .table-header h2 {
          color: #7a4a4c;
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .table-container {
          overflow-x: auto;
          padding: 0 1.5rem 1.5rem;
        }
        
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        
        thead {
          background-color: #fff0f0;
        }
        
        th {
          padding: 0.75rem 1.5rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 500;
          color: #9b6a6c;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        tbody tr {
          transition: background-color 0.2s ease;
        }
        
        tbody tr:hover {
          background-color: #fff0f0;
        }
        
        td {
          padding: 1rem 1.5rem;
          font-size: 0.875rem;
          color: #5c2e30;
          border-bottom: 1px solid #fbd5d5;
        }
        
        .category-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .trauma {
          background-color: #fbd5d5;
          color: #7a4a4c;
        }
        
        .psychiatric {
          background-color: #e9d5ff;
          color: #6b46c1;
        }
        
        .duration-value {
          font-weight: 600;
          color: #7a4a4c;
        }
        
        .duration-unit {
          font-size: 0.75rem;
          color: #9b6a6c;
          margin-left: 0.25rem;
        }
          .ccc {
          font-size: 1.5rem;
          color: #9b6a6c;
          margin-left: 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default SupervisionAnomalies;