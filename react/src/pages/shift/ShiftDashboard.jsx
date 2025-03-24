import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Popup from "reactjs-popup";
import { useState, useEffect } from "react";
import axios from "axios";

export function ShiftDashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState({}); // Store selected employees
  const [shifts, setShifts] = useState([]);

  function handleDateSelect(selectInfo) {
    setSelectedDate(selectInfo.dateStr);
    setShowPopup(true);
  }

  async function getActiveEmployee() {
    try {
      const response = await axios.get("http://localhost:3000/user/active");
      setActiveEmployees(response.data);
    } catch (error) {
      console.error(error.response.data.error);
    }
  }

  async function getShifts() {
    axios
      .get("http://localhost:3000/shifts")
      .then((response) => {
        setShifts(response.data);
        console.log("Shifts retrieved:", response.data);
        for (const shift of shifts) {
          console.log(shift);
          shift.title = shift.area;
          const date = shift.date.toISOString().replace(/T.*$/, '') // YYYY-MM-DD of today 
          if(shift.shiftType=="Day_shift") {
            shift.start = date + "T00:00:01"
            shift.end = date + "T08:00:00"
          }
          console.log("add title , start and end date to each " + shift)
        }
      })
      .catch((error) => {
        console.error("Error retrieving shift:", error.response.data);
        console.error("Error retrieving shift:", error);
      });
  }

  useEffect(() => {
    getActiveEmployee();
  }, []);

  useEffect(() => {
    getShifts();
  }, [showPopup]);

  const staffingRules = {
    Triage: { triage_nurse: 2 },
    Resuscitation: { doctor: 2, nurse: 6 },
    Major_Trauma: { doctor: 1, nurse: 2 },
    General_ED: { receptionist: 1, ambulance_driver: 2 },
  };

  function handleEmployeeSelection(role, index, value) {
    setSelectedEmployees((prev) => ({
      ...prev,
      [role]: { ...(prev[role] || {}), [index]: value },
    }));
  }

  function handleSubmit() {
    const newShift = {
      shiftType: document.querySelector("#siftType").value,
      area: document.querySelector("#area").value,
      date: new Date(selectedDate),
      employees: [],
    };

    // Get selected employees
    Object.entries(staffingRules[selectedArea] || {}).forEach(
      ([role, count]) => {
        newShift.employees[role] = [];
        for (let i = 0; i < count; i++) {
          const selectedValue = selectedEmployees[role]?.[i] || "";
          if (selectedValue) {
            newShift.employees.push({
              employeeId: selectedValue, // employee ID (use the `id` of the selected employee)
              role: role, // employee role
            });
          }
        }
      }
    );

    console.log("New Shift Data:", newShift);
    console.log("Final Shift Data:", JSON.stringify(newShift, null, 2));

    // Send data to backend
    axios
      .post("http://localhost:3000/shifts", newShift)
      .then((response) => {
        console.log("Shift added:", response.data);
        setShowPopup(false);
      })
      .catch((error) => {
        console.error("Error adding shift:", error.response.data);
      });
  }

  return (
    <div>
      <h1>Demo App</h1>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        weekends={false}
        events={shifts}
        eventContent={renderEventContent}
        dateClick={handleDateSelect}
      />

      {/* Popup */}
      <Popup open={showPopup} onClose={() => setShowPopup(false)} modal>
        <div className="form">
          <h2>Add new shift for {selectedDate}</h2>
          <br />
          <label>Shift type</label>
          <select id="siftType">
            <option value="Day_shift">Day shift</option>
            <option value="Evening_shift">Event shift</option>
            <option value="Night_shift">Night shift</option>
          </select>

          <label>Area</label>
          <select
            id="area"
            onChange={(e) => setSelectedArea(e.target.value)}
            value={selectedArea}
          >
            <option value="">Select an area</option>
            <option value="Triage">Triage</option>
            <option value="Resuscitation">Resuscitation</option>
            <option value="Major_Trauma">Major Trauma</option>
            <option value="General_ED">General ED</option>
          </select>

          {/* Conditionally Render Inputs Based on Area Selection */}
          {selectedArea &&
            Object.entries(staffingRules[selectedArea] || {}).map(
              ([role, count]) => (
                <div key={role}>
                  <label>
                    {role} ({count} required)
                  </label>
                  {[...Array(count)].map((_, index) => (
                    <select
                      key={index}
                      className="employee-dropdown"
                      onChange={(e) =>
                        handleEmployeeSelection(role, index, e.target.value)
                      }
                    >
                      <option value="">Select {role}</option>
                      {activeEmployees
                        .filter((employee) => employee.role === role) // Filter employees by role
                        .map((employee) => (
                          <option key={employee._id} value={employee._id}>
                            {employee.name}
                          </option>
                        ))}
                    </select>
                  ))}
                </div>
              )
            )}

          <button type="button" onClick={handleSubmit}>
            Add Shift
          </button>
          <button onClick={() => setShowPopup(false)}>Close</button>
        </div>
      </Popup>
    </div>
  );
}

// Custom render function for events
function renderEventContent(eventInfo) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <i>{eventInfo.event.title}</i>
    </>
  );
}
