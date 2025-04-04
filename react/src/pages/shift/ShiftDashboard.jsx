import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import Popup from "reactjs-popup";
import { useState, useEffect } from "react";
import axios from "axios";

export function ShiftDashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedShiftType, setselectedShiftType] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState({}); // Store selected employees
  const [shifts, setShifts] = useState([]);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [validationError, setValidationError] = useState(""); // For showing validation errors

  function handleDateSelect(selectInfo) {
    setSelectedDate(selectInfo.dateStr);
    setShowPopup(true);
    // Reset employee selections and validation errors when opening a new popup
    setSelectedEmployees({});
    setValidationError("");
  }

  async function handleDeleteEvent() {
    await deleteShiftId(selectedEvent.id);
    setShowPopup(false);
  }

  async function getActiveEmployee() {
    try {
      const response = await axios.get("http://localhost:3000/user/active");
      setActiveEmployees(response.data);
    } catch (error) {
      console.error(error.response?.data?.error || "Failed to fetch employees");
    }
  }

  async function getShifts() {
    try {
      const response = await axios.get("http://localhost:3000/shifts");
      const formattedShifts = response.data.map((shift) => {
        let date = new Date(shift.date).toISOString().split("T")[0]; // Ensure proper date formatting

        return {
          id: shift._id,
          title: shift.area,
          start:
            shift.shiftType === "Day_shift"
              ? `${date}T00:00:01`
              : shift.shiftType === "Evening_shift"
              ? `${date}T08:00:01`
              : `${date}T16:00:01`, // Adjust timing for different shift types
          end:
            shift.shiftType === "Day_shift"
              ? `${date}T08:00:00`
              : shift.shiftType === "Evening_shift"
              ? `${date}T16:00:00`
              : `${date}T23:59:59`, // Ensure night shift end time
        };
      });

      setShifts(formattedShifts);
      console.log("Formatted Shifts:", formattedShifts);
    } catch (error) {
      console.error("Error retrieving shifts:", error);
    }
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

  // Get all selected employee IDs across all roles
  const getAllSelectedEmployeeIds = () => {
    const allSelectedIds = [];
    Object.values(selectedEmployees).forEach(roleSelections => {
      Object.values(roleSelections).forEach(id => {
        if (id) allSelectedIds.push(id);
      });
    });
    return allSelectedIds;
  };

  // Validate that all required positions are filled
  const validateAllPositionsFilled = () => {
    if (!selectedArea) {
      setValidationError("Please select an area");
      return false;
    }

    const areaRules = staffingRules[selectedArea];
    if (!areaRules) return true; // No roles defined for this area
    
    let allFilled = true;
    let missingPositions = [];

    Object.entries(areaRules).forEach(([role, count]) => {
      for (let i = 0; i < count; i++) {
        const isPositionFilled = selectedEmployees[role]?.[i];
        if (!isPositionFilled) {
          allFilled = false;
          missingPositions.push(`${role} #${i + 1}`);
        }
      }
    });

    if (!allFilled) {
      setValidationError(`Please fill all required positions: ${missingPositions.join(", ")}`);
    } else {
      setValidationError("");
    }

    return allFilled;
  };

  function handleEmployeeSelection(role, index, value) {
    setSelectedEmployees((prev) => ({
      ...prev,
      [role]: { ...(prev[role] || {}), [index]: value },
    }));
    // Clear validation error when a selection is made
    setValidationError("");
  }

  function handleEventClick(eventClickInfo) {
    // Reset employee selections and validation errors when opening a new event
    setSelectedEmployees({});
    setValidationError("");
    
    let starTime = eventClickInfo.event.start.toString().split(" ")[4];
    if (starTime === "00:00:01") setselectedShiftType("Day_shift");
    else if (starTime === "08:00:01") setselectedShiftType("Evening_shift");
    else setselectedShiftType("Night_shift");

    setSelectedArea(eventClickInfo.event.title);
    setSelectedEvent(eventClickInfo.event);
    setSelectedDate(eventClickInfo.event.startStr);

    console.log(selectedEvent);
    console.log(eventClickInfo.event);
    console.log(selectedEvent.id);
    setShowDeleteButton(true);
    setShowPopup(true);
    
    // Load existing employee assignments for this event
    loadExistingEmployees(eventClickInfo.event.id);
  }
  
  // Function to load existing employees for an event
  async function loadExistingEmployees(eventId) {
    try {
      const shift = await getShiftById(eventId);
      if (shift && shift.employees) {
        // Transform the employees array into the format used by selectedEmployees
        const employeeSelections = {};
        
        // Group employees by role
        const employeesByRole = {};
        shift.employees.forEach(emp => {
          if (!employeesByRole[emp.role]) {
            employeesByRole[emp.role] = [];
          }
          employeesByRole[emp.role].push(emp.employeeId);
        });
        
        // Format into selectedEmployees structure
        Object.entries(employeesByRole).forEach(([role, ids]) => {
          employeeSelections[role] = {};
          ids.forEach((id, index) => {
            employeeSelections[role][index] = id;
          });
        });
        
        setSelectedEmployees(employeeSelections);
      }
    } catch (error) {
      console.error("Error loading existing employees:", error);
    }
  }

  // update event
  function handleSubmit() {
    // First validate all positions are filled
    if (!validateAllPositionsFilled()) {
      return; // Don't proceed if validation fails
    }

    const [datePart, timePart] = selectedDate.split("T");
    let hour = timePart ? timePart.split(":")[0] : "00";
    let date = selectedDate; // Default to selectedDate

    console.log("Hour:", hour);
    
    // Ensure date is correctly formatted
    if (hour === "00") {
      date =
        `${datePart}T01:${timePart ? timePart.split(":")[1] : "00"}:${
          timePart ? timePart.split(":")[2] : "00"
        }:00`;
      console.log("date " + date);
    }

    let eventId = selectedEvent.id;

    const newShift = {
      shiftType: document.querySelector("#siftType").value,
      area: document.querySelector("#area").value,
      date: Date.parse(date),
      employees: [],
    };

    newShift.id = eventId;

    // Get selected employees
    Object.entries(staffingRules[selectedArea] || {}).forEach(
      ([role, count]) => {
        for (let i = 0; i < count; i++) {
          const selectedValue = selectedEmployees[role]?.[i] || "";
          if (selectedValue) {
            newShift.employees.push({
              employeeId: selectedValue, // employee ID
              role: role, // employee role
            });
          }
        }
      }
    );

    console.log("New Shift Data:", newShift);
    console.log("Final Shift Data:", JSON.stringify(newShift, null, 2));

    // Send data to backend
    if (eventId) {
      axios
        .put("http://localhost:3000/shifts", newShift)
        .then((response) => {
          console.log("Shift updated:", response.data);
          setShowPopup(false);
        })
        .catch((error) => {
          console.error("Error updating shift:", error.response?.data || error);
        });
    } else {
      axios
        .post("http://localhost:3000/shifts", newShift)
        .then((response) => {
          console.log("Shift added:", response.data);
          setShowPopup(false);
        })
        .catch((error) => {
          console.error("Error adding shift:", error.response?.data || error);
        });
    }
    setSelectedEvent({});
  }

  async function updateShift(eventDropInfo) {
    console.log(eventDropInfo.event.end.toString());
    const newDate = eventDropInfo.event.end.toISOString().split("T")[0];

    let starTime = eventDropInfo.event.start.toString().split(" ")[4];
    let endTime = eventDropInfo.event.end.toString().split(" ")[4];

    if (
      (starTime === "00:00:01" && endTime === "08:00:00") ||
      (starTime === "08:00:01" &&
        (endTime === "16:00:00" || endTime === "15:59:59")) ||
      (starTime === "16:00:01" &&
        (endTime === "23:59:59" || endTime === "00:00:00"))
    ) {
      console.log(eventDropInfo.event.id);

      // ✅ Await the response
      const shift = await getShiftById(eventDropInfo.event.id);

      if (!shift) {
        console.error("Shift not found or error occurred.");
        return;
      }

      if (starTime === "00:00:01" && shift.shiftType !== "Day_shift") {
        shift.shiftType = "Day_shift"; // Fixing incorrect assignment
      } else if (
        starTime === "08:00:01" &&
        shift.shiftType !== "Evening_shift"
      ) {
        shift.shiftType = "Evening_shift";
      } else if (starTime === "16:00:01" && shift.shiftType !== "Night_shift") {
        shift.shiftType = "Night_shift";
      }
      shift.date = newDate;

      if (verifyarea(shift, eventDropInfo.event.end.toISOString())) {
        eventDropInfo.revert();
        alert("Area already exists for this shift time");
        return;
      }

      try {
        const response = await axios.put("http://localhost:3000/shifts", shift);
        console.log("Shift modified:", response.data);
      } catch (error) {
        console.error(
          "Error modifying shift:",
          error.response?.data || error.message
        );
      }
    } else {
      console.log("Wrong shift timing");
      eventDropInfo.revert();
    }

    getShifts();

    console.log(starTime);
    console.log(endTime);
    console.log(
      "Updated event: " + JSON.stringify(eventDropInfo.event, null, 2)
    );
    console.log(
      "Old event: " + JSON.stringify(eventDropInfo.oldEvent, null, 2)
    );
  }

  const verifyarea = (shift, shitDateInStringFormat) => {
    let shiftStartDate;
    const datePart = shitDateInStringFormat.split("T")[0];
    if (shift.shiftType == "Day_shift")
      shiftStartDate = datePart + "T" + "00:00:01";
    else if (shift.shiftType == "Evening_shift")
      shiftStartDate = datePart + "T" + "08:00:01";
    else shiftStartDate = datePart + "T" + "16:00:01";

    return shifts.some((element) => {
      let elementArea = element.title;
      return elementArea == shift.area && shiftStartDate == element.start;
    });
  };

  function handleAddEvent() {
    // First validate all positions are filled
    if (!validateAllPositionsFilled()) {
      return; // Don't proceed if validation fails
    }

    const [datePart, timePart] = selectedDate.split("T");
    let hour = timePart ? timePart.split(":")[0] : "00";
    let date = selectedDate; // Default to selectedDate

    console.log("Hour:", hour);
    
    // Ensure date is correctly formatted
    if (hour === "00") {
      date =
        `${datePart}T01:${timePart ? timePart.split(":")[1] : "00"}:${
          timePart ? timePart.split(":")[2] : "00"
        }:00`;
      console.log("date " + date);
    }

    const newShift = {
      shiftType: document.querySelector("#siftType").value,
      area: document.querySelector("#area").value,
      date: Date.parse(date),
      employees: [],
    };

    if (verifyarea(newShift, date)) {
      setValidationError("Area already exists for this shift time");
      return;
    }

    // Get selected employees
    Object.entries(staffingRules[selectedArea] || {}).forEach(
      ([role, count]) => {
        for (let i = 0; i < count; i++) {
          const selectedValue = selectedEmployees[role]?.[i] || "";
          if (selectedValue) {
            newShift.employees.push({
              employeeId: selectedValue,
              role: role,
            });
          }
        }
      }
    );

    console.log("Final Shift Data:", JSON.stringify(newShift, null, 2));

    // Send data to backend
    axios
      .post("http://localhost:3000/shifts", newShift)
      .then((response) => {
        console.log("Shift added:", response.data);
        setShowPopup(false);
        setValidationError("");
      })
      .catch((error) => {
        console.error("Error adding shift:", error.response?.data || error);
        setValidationError("Error adding shift: " + (error.response?.data?.error || "Unknown error"));
      });
  }

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        initialView="timeGridWeek"
        weekends={true}
        events={shifts}
        editable={true}
        eventDrop={updateShift}
        eventContent={renderEventContent}
        dateClick={handleDateSelect}
        eventClick={handleEventClick}
      />

      {/* Popup */}
      <Popup open={showPopup} onClose={() => setShowPopup(false)} modal>
        <div className="bg-white p-[15px] shadow-xl max-w-lg w-full mx-auto border border-gray-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Shift for {selectedDate.split("T")[0]}
          </h2>

          {/* Validation error message */}
          {validationError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{validationError}</p>
            </div>
          )}

          {/* Shift Type and Area */}
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label className="block text-sm font-semibold text-gray-700">
                Shift type
              </label>
              <select
                id="siftType"
                className="w-full p-2 border rounded-lg bg-gray-50"
                onChange={(e) => setselectedShiftType(e.target.value)}
                value={selectedShiftType}
              >
                <option value="Day_shift">Day shift</option>
                <option value="Evening_shift">Evening shift</option>
                <option value="Night_shift">Night shift</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-semibold text-gray-700">
                Area
              </label>
              <select
                id="area"
                onChange={(e) => {
                  setSelectedArea(e.target.value);
                  // Reset employee selections when area changes
                  setSelectedEmployees({});
                  setValidationError("");
                }}
                value={selectedArea}
                className="w-full p-2 border rounded-lg bg-gray-50"
              >
                <option value="">Select an area</option>
                <option value="Triage">Triage</option>
                <option value="Resuscitation">Resuscitation</option>
                <option value="Major_Trauma">Major Trauma</option>
                <option value="General_ED">General ED</option>
              </select>
            </div>
          </div>

          {/* Dynamic Role Selection */}
          {selectedArea &&
            Object.entries(staffingRules[selectedArea] || {}).map(
              ([role, count]) => (
                <div key={role} className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    {role} ({count} required)
                  </label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {[...Array(count)].map((_, index) => {
                      // Get all currently selected employees except this dropdown
                      const allSelectedIds = getAllSelectedEmployeeIds();
                      const currentValue = selectedEmployees[role]?.[index] || "";
                      
                      // If this dropdown has a value, remove it from the list of "taken" IDs
                      const takenIds = currentValue 
                        ? allSelectedIds.filter(id => id !== currentValue)
                        : allSelectedIds;
                      
                      return (
                        <select
                          key={index}
                          className="w-full p-2 border rounded-lg bg-gray-50"
                          value={currentValue}
                          onChange={(e) =>
                            handleEmployeeSelection(role, index, e.target.value)
                          }
                        >
                          <option value="">Select {role}</option>
                          {activeEmployees
                            .filter((employee) => employee.role === role)
                            .map((employee) => (
                              <option
                                key={employee._id}
                                value={employee._id}
                                disabled={takenIds.includes(employee._id)}
                              >
                                {employee.name} {takenIds.includes(employee._id) ? "(Already selected)" : ""}
                              </option>
                            ))}
                        </select>
                      );
                    })}
                  </div>
                </div>
              )
            )}

          {/* Action Buttons */}
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={handleAddEvent}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={!selectedArea}
            >
              Add Shift
            </button>

            {showDeleteButton && (
              <>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                >
                  Edit Shift
                </button>
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Delete Event
                </button>
              </>
            )}

            <button
              onClick={() => setShowPopup(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
            >
              Close
            </button>
          </div>
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

async function getShiftById(id) {
  try {
    const response = await axios.get(`http://localhost:3000/shifts/${id}`);
    console.log(response.data); // Debugging
    return response.data; // Return the shift object
  } catch (error) {
    console.error(
      "Error fetching shift:",
      error.response?.data || error.message
    );
    return null; // Return null in case of an error
  }
}

async function deleteShiftId(id) {
  try {
    const response = await axios.delete(`http://localhost:3000/shifts/${id}`);
    console.log(response.data); // Debugging
    return response.data; // Return the shift object
  } catch (error) {
    console.error(
      "Error fetching shift:",
      error.response?.data || error.message
    );
    return null; // Return null in case of an error
  }
}