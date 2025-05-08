import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Bar } from 'react-chartjs-2';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import { useParams } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend);

const TreatmentStatsPage = () => {
  const { patientId } = useParams(); // Get patient ID from URL
  const [monthlyData, setMonthlyData] = useState(null);
  const [successRateData, setSuccessRateData] = useState(null);
  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set loading state to true
    setLoading(true);

    // Fetch Monthly Stats
    axios.get(`http://localhost:3000/api/treatments/monthly-stats/${patientId}`)
      .then(response => {
        const stats = response.data;
        const months = stats.map(item => `${item._id.month}-${item._id.year}`);
        const active = stats.map(item => item.active);
        const completed = stats.map(item => item.completed);

        setMonthlyData({
          labels: months,
          datasets: [
            {
              label: 'Active Treatments',
              data: active,
              borderColor: 'green',
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
              fill: true,
            },
            {
              label: 'Completed Treatments',
              data: completed,
              borderColor: 'red',
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
              fill: true,
            },
          ],
        });
      })
      .catch(error => console.error('Error fetching monthly stats:', error));

    // Fetch Success Rate by Doctor
    axios.get(`http://localhost:3000/api/treatments/success-rate-by-doctor/${patientId}`)
      .then(response => {
        const stats = response.data;
        const doctorNames = stats.map(item => item.doctorId ? `${item.doctorId.name} ${item.doctorId.familyName}` : 'Unknown Doctor');
        const successRates = stats.map(item => item.successRate);

        setSuccessRateData({
          labels: doctorNames,
          datasets: [
            {
              label: 'Success Rate',
              data: successRates,
              backgroundColor: 'blue',
              borderColor: 'blue',
              borderWidth: 1,
            },
          ],
        });
      })
      .catch(error => console.error('Error fetching success rate by doctor:', error));

    // Fetch Category Stats
    axios.get(`http://localhost:3000/api/treatments/category-stats/${patientId}`)
      .then(response => {
        const stats = response.data;
        const categories = stats.map(item => item._id);
        const counts = stats.map(item => item.count);

        // Ignore negative durations for display
        const avgDurations = stats.map(item => item.avgDuration > 0 ? item.avgDuration.toFixed(2) : 'N/A');

        setCategoryData({
          labels: categories,
          datasets: [
            {
              label: 'Treatments by Category',
              data: counts,
              backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'],
              borderColor: '#fff',
              borderWidth: 1,
            },
          ],
        });
      })
      .catch(error => console.error('Error fetching category stats:', error))
      .finally(() => setLoading(false)); // Set loading to false after all data is fetched
  }, [patientId]);

  // Check if the data is available before rendering
  if (loading) {
    return <div>Loading...</div>;
  }

  // Only render the charts if data is available
  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Treatment Statistics</h1>
      <div className="row">
        {/* Graph for Monthly Stats */}
        <div className="col-md-4">
          <h2>Monthly Stats</h2>
          {monthlyData && <Line data={monthlyData} />}
        </div>

        {/* Graph for Success Rate by Doctor */}
        <div className="col-md-4">
          <h2>Success Rate by Doctor</h2>
          {successRateData && <Bar data={successRateData} />}
        </div>

        {/* Graph for Category Stats */}
        <div className="col-md-4">
          <h2>Category Stats</h2>
          {categoryData && <Pie data={categoryData} />}
        </div>
      </div>
    </div>
  );
};

export default TreatmentStatsPage;
