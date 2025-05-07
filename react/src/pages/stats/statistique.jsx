/** @format */
import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from "recharts";

const EmployeeStats = () => {
  const [statusStats, setStatusStats] = useState([]);
  const [roleStats, setRoleStats] = useState([]);
  const [genderStats, setGenderStats] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

    
    const COLORS = [


      "hsl(183, 58.40%, 84.90%)" ,
      "hsl(0, 100.00%, 84.90%)",   
      "hsl(14, 100%, 81.8%)", 
      "hsl(60, 63.60%, 89.20%)",    
      
    ];
  

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statusRes, roleRes, genderRes] = await Promise.all([
          fetch("http://localhost:3000/user/stats/status"),
          fetch("http://localhost:3000/user/stats/role"),
          fetch("http://localhost:3000/user/stats/gender"),
        ]);

        const [statusData, roleData, genderData] = await Promise.all([
          statusRes.json(),
          roleRes.json(),
          genderRes.json(),
        ]);

        const filteredRoleData = (roleData || [])
          .filter((item) => item?._id !== "admin")
          .map((item) => ({
            name: item?._id?.replace("_", " ") || "Unknown",
            value: item?.count || 0,
          }));

        setRoleStats(filteredRoleData);
        setGenderStats(
          (genderData || []).map((item) => ({
            name: item?._id || "Unknown",
            value: item?.count || 0,
          }))
        );
        setStatusStats(statusData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-spinner">Chargement...</div>;
  if (error) return <div className="error-alert">Erreur: {error}</div>;

  return (
    <div className="stats-container">
      <h2 className="stats-title">Employee Statistics</h2>

      <div className="chart-grid">
        {/* Role Distribution Card */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Role Distribution</h3>
            <p className="chart-subtitle">Employees per department</p>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={roleStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 90%)" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                  tick={{ fill: "hsl(0, 0%, 40%)" }}
                />
                <YAxis allowDecimals={false} tick={{ fill: "hsl(0, 0%, 40%)" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(0, 0%, 90%)",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {roleStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Distribution Card */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Gender Ratio</h3>
            <p className="chart-subtitle">Company diversity overview</p>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart
                innerRadius="30%"
                outerRadius="100%"
                data={genderStats}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  minAngle={15}
                  label={{ fill: "hsl(0, 0%, 40%)", position: "insideStart" }}
                  background
                  clockWise={true}
                  dataKey="value"
                  radius={16}
                >
                  {genderStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </RadialBar>
                <Legend
                  iconSize={12}
                  wrapperStyle={{ fontSize: "14px", color: "hsl(0, 0%, 40%)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(0, 0%, 90%)",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Card */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Employment Status</h3>
            <p className="chart-subtitle">Current work status distribution</p>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}\n${value}`}
                >
                  {statusStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend
                  iconSize={12}
                  wrapperStyle={{ fontSize: "14px", color: "hsl(0, 0%, 40%)" }}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(0, 0%, 90%)",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style>{`
        .stats-container {
          padding: 2rem;
          max-width: 1440px;
          margin: 0 auto;
        }

        .stats-title {
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 2rem;
          color: hsl(0, 0%, 20%);
          letter-spacing: -0.025em;
        }

        .chart-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
          gap: 1.5rem;
        }

        .chart-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05),
                      0 2px 4px -1px rgba(0, 0, 0, 0.02);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .chart-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px -1px rgba(0, 0, 0, 0.08),
                      0 4px 6px -1px rgba(0, 0, 0, 0.03);
        }

        .chart-header {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid hsl(0, 0%, 93%);
        }

        .chart-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: hsl(0, 0%, 15%);
          margin-bottom: 0.25rem;
        }

        .chart-subtitle {
          font-size: 0.875rem;
          color: hsl(0, 0%, 45%);
        }

        .chart-wrapper {
          height: 300px;
        }

        .loading-spinner {
          text-align: center;
          padding: 2rem;
          color: hsl(0, 0%, 45%);
          font-size: 1.2rem;
        }

        .error-alert {
          padding: 2rem;
          background: hsl(0, 90%, 95%);
          color: hsl(0, 90%, 45%);
          border-radius: 0.5rem;
          margin: 2rem;
          border: 1px solid hsl(0, 90%, 85%);
        }

        .recharts-tooltip-item {
          font-size: 0.875rem !important;
          color: hsl(0, 0%, 30%) !important;
        }

        .recharts-default-tooltip {
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default EmployeeStats;
