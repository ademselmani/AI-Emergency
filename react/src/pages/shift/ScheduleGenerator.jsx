import { useState, useEffect } from "react";
import axios from "axios";

export function ScheduleGenerator() {
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch active employees
  useEffect(() => {
    const fetchActiveEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:3000/user/active");
        setActiveEmployees(response.data);
      } catch (error) {
        console.error("Error fetching active employees:", error);
        setError("Failed to fetch active employees.");
      }
    };
    fetchActiveEmployees();
  }, []);

  // Generate schedule using Azure OpenAI (simulated)
  const generateSchedule = async () => {
    setLoading(true);
    setError("");
    try {
      // Simulate Azure OpenAI API call
      const response = await axios.post("http://localhost:3000/ai/generate-schedule", {
        employees: activeEmployees,
        weekStart: "2025-05-05",
        weekEnd: "2025-05-11",
        staffingRules: {
          Resuscitation: { doctor: 2 },
          Major_Trauma: { doctor: 1 },
          Triage: { triage_nurse: 2 },
          General_ED: { receptionist: 1, ambulance_driver: 2 }
        }
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.AZURE_OPENAI_API_KEY}` // Replace with actual key
        }
      });

      const newSchedule = response.data;
      setSchedule(newSchedule);

      // Store schedule in database
      await axios.post("http://localhost:3000/shifts/batch", newSchedule.schedule);
      console.log("Schedule stored successfully.");
    } catch (error) {
      console.error("Error generating or storing schedule:", error);
      setError("Failed to generate or store schedule.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!activeEmployees.length) {
    return <div>Loading active employees...</div>;
  }

  return (
    <div className="p-4">
      {/* <h2 className="text-2xl font-bold mb-4">IA Weekly Schedule</h2> */}
      <button
        onClick={generateSchedule}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Schedule"}
      </button>

      {schedule && (
        <div >
          <h3 className="text-xl font-semibold mb-2">IA Generated Schedule</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(schedule, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}