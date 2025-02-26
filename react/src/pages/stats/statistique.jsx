/** @format */

import React, { useState, useEffect } from "react"
import { Card, Button, Image } from 'semantic-ui-react';

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
} from "recharts"

const EmployeeStats = () => {
  const [statusStats, setStatusStats] = useState([])
  const [roleStats, setRoleStats] = useState([])
  const [genderStats, setGenderStats] = useState([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statusRes, roleRes, genderRes] = await Promise.all([
          fetch("http://localhost:3001/user/stats/status"),
          fetch("http://localhost:3001/user/stats/role"),
          fetch("http://localhost:3001/user/stats/gender"),
        ])

        const statusData = await statusRes.json()
        const roleData = await roleRes.json()
        const genderData = await genderRes.json()

        const filteredRoleData = (roleData || [])
          .filter((item) => item?._id !== "admin")
          .map((item) => ({
            name: item?._id?.replace("_", " ") || "Unknown",
            value: item?.count || 0,
          }))

        setRoleStats(filteredRoleData)
        setGenderStats(
          (genderData || []).map((item) => ({
            name: item?._id || "Unknown",
            value: item?.count || 0,
          }))
        )
        setStatusStats(statusData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div>Chargement...</div>
  if (error) return <div>Erreur: {error}</div>

  return (
    <div className='stats-container'>
      <h2 className='stats-title'>Statistiques des Employés</h2>

      <div className='charts-row'>
        <div className='chart-card'>
          <h3 className='chart-title'>Répartition des Employés par Rôle</h3>
          <p className='chart-description'>
            Nombre d'employés pour chaque rôle dans l'entreprise.
          </p>
          <div className='chart-container'>
            <BarChart
              width={500}
              height={300}
              data={roleStats}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='name'
                angle={-45}
                textAnchor='end'
                height={60}
                interval={0}
              />
              <YAxis domain={[0, "auto"]} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey='value'>
                {roleStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </div>
        </div>

        <div className='chart-card'>
          <h3 className='chart-title'>Répartition des Employés par Genre</h3>
          <p className='chart-description'>
            Nombre d'employés pour chaque genre dans l'entreprise.
          </p>
          <div className='chart-container'>
            <RadialBarChart
              width={500}
              height={300}
              innerRadius='30%'
              outerRadius='100%'
              data={genderStats}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                minAngle={15}
                label={{ fill: "#666", position: "insideStart" }}
                background
                clockWise={true}
                dataKey='value'
              >
                {genderStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={["#9966FF", "#FF99CC"][index % 2]}
                  />
                ))}
              </RadialBar>
              <Legend />
              <Tooltip />
            </RadialBarChart>
          </div>
        </div>

        <div className='chart-card'>
          <h3 className='chart-title'>Répartition des Employés par Statut</h3>
          <p className='chart-description'>
            Nombre d'employés pour chaque statut dans l'entreprise.
          </p>
          <div className='chart-container'>
            <PieChart width={500} height={300}>
              <Pie
                data={statusStats}
                cx='50%'
                cy='50%'
                labelLine={true}
                label={({ name, value }) => `${name} (${value})`}
                outerRadius={100}
                fill='#8884d8'
                dataKey='value'
              >
                {statusStats.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>

      <style>{`
        .stats-container {
          padding: 20px;
          max-width: 1600px;
          margin: 0 auto;
        }

        .stats-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 24px;
          color: #333;
        }

        .charts-row {
          display: flex;
          gap: 20px;
          justify-content: space-around;
          flex-wrap: wrap;
        }

        .chart-card {
          flex: 1;
          min-width: 500px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 20px;
          margin-bottom: 20px;
        }

        .chart-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #444;
        }

        .chart-description {
          font-size: 14px;
          color: #666;
          margin-bottom: 16px;
        }

        .chart-container {
          width: 100%;
          overflow-x: auto;
          display: flex;
          justify-content: center;
        }
      `}</style>
    </div>
    
  )

}


export default EmployeeStats
