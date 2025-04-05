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
  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [shifts, setShifts] = useState([]);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [validationError, setValidationError] = useState("");
  const [employeeShiftAssignments, setEmployeeShiftAssignments] = useState({});
  const [currentShiftEmployees, setCurrentShiftEmployees] = useState([]);

  function handleDateSelect(selectInfo) {
    setSelectedDate(selectInfo.dateStr);
    setShowPopup(true);
    setSelectedEmployees({});
    setValidationError("");
    setCurrentShiftEmployees([]);
    setSelectedEvent({});
    setShowDeleteButton(false);
  }

  async function handleDeleteEvent() {
    await deleteShiftId(selectedEvent.id);
    setShowPopup(false);
    getShifts();
  }

  async function getActiveEmployee() {
    try {
      const response = await axios.get("http://localhost:3000/user/active");
      setActiveEmployees(response.data);
    } catch (error) {
      console.error(error.response?.data?.error || "Failed to fetch employees");
    }
  }

  function getShiftTypeFromStartTime(startTime) {
    const hour = startTime.split('T')[1].substring(0, 2);
    if (hour === "00") return "Day_shift";
    if (hour === "08") return "Evening_shift";
    if (hour === "16") return "Night_shift";
    return null;
  }

  const processEmployeeAssignments = async () => {
    try {
      const response = await axios.get("http://localhost:3000/shifts");
      const assignments = {};
      
      for (const shift of response.data) {
        const date = new Date(shift.date).toISOString().split('T')[0];
        const shiftType = shift.shiftType;
        
        if (selectedEvent.id === shift._id) continue;
        
        if (shift.employees && shift.employees.length > 0) {
          shift.employees.forEach(emp => {
            const key = `${date}-${shiftType}-${emp.employeeId}`;
            assignments[key] = true;
          });
        }
      }
      
      setEmployeeShiftAssignments(assignments);
    } catch (error) {
      console.error("Error processing employee assignments:", error);
    }
  };

  async function getShifts() {
    try {
      const response = await axios.get("http://localhost:3000/shifts");
      const formattedShifts = response.data.map((shift) => {
        let date = new Date(shift.date).toISOString().split("T")[0];
        return {
          id: shift._id,
          title: shift.area,
          start:
            shift.shiftType === "Day_shift"
              ? `${date}T00:00:01`
              : shift.shiftType === "Evening_shift"
              ? `${date}T08:00:01`
              : `${date}T16:00:01`,
          end:
            shift.shiftType === "Day_shift"
              ? `${date}T08:00:00`
              : shift.shiftType === "Evening_shift"
              ? `${date}T16:00:00`
              : `${date}T23:59:59`,
        };
      });
      setShifts(formattedShifts);
    } catch (error) {
      console.error("Error retrieving shifts:", error);
    }
  }

  useEffect(() => {
    getActiveEmployee();
  }, []);

  useEffect(() => {
    getShifts();
    processEmployeeAssignments();
  }, [showPopup, selectedEvent.id]);

  const staffingRules = {
    Triage: { triage_nurse: 2 },
    Resuscitation: { doctor: 2, nurse: 6 },
    Major_Trauma: { doctor: 1, nurse: 2 },
    General_ED: { receptionist: 1, ambulance_driver: 2 },
  };

  const getAllSelectedEmployeeIds = () => {
    const allSelectedIds = [];
    Object.values(selectedEmployees).forEach(roleSelections => {
      Object.values(roleSelections).forEach(id => {
        if (id) allSelectedIds.push(id);
      });
    });
    return allSelectedIds;
  };

  const isEmployeeAssignedToSameShift = (employeeId, date, shiftType) => {
    const datePart = date.split('T')[0];
    const key = `${datePart}-${shiftType}-${employeeId}`;
    
    if (currentShiftEmployees.includes(employeeId)) {
      return false;
    }
    
    return employeeShiftAssignments[key] === true;
  };

  const validateAllPositionsFilled = () => {
    if (!selectedArea) {
      setValidationError("Please select an area");
      return false;
    }

    const areaRules = staffingRules[selectedArea];
    if (!areaRules) return true;
    
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
    const currentShiftType = document.querySelector("#siftType").value;
    
    if (value && isEmployeeAssignedToSameShift(value, selectedDate, currentShiftType)) {
      setValidationError(`This employee is already assigned to a ${currentShiftType.replace('_', ' ')} on this date.`);
      return;
    }

    const allSelectedIds = getAllSelectedEmployeeIds();
    if (value && allSelectedIds.includes(value) && selectedEmployees[role]?.[index] !== value) {
      setValidationError("This employee is already selected for another role in this shift.");
      return;
    }

    setSelectedEmployees((prev) => ({
      ...prev,
      [role]: { ...(prev[role] || {}), [index]: value },
    }));
    
    setValidationError("");
  }

  function handleEventClick(eventClickInfo) {
    setSelectedEmployees({});
    setValidationError("");
    
    let starTime = eventClickInfo.event.start.toString().split(" ")[4];
    if (starTime === "00:00:01") setselectedShiftType("Day_shift");
    else if (starTime === "08:00:01") setselectedShiftType("Evening_shift");
    else setselectedShiftType("Night_shift");

    setSelectedArea(eventClickInfo.event.title);
    setSelectedEvent(eventClickInfo.event);
    setSelectedDate(eventClickInfo.event.startStr);
    setShowDeleteButton(true);
    setShowPopup(true);
    
    loadExistingEmployees(eventClickInfo.event.id);
  }
  
  async function loadExistingEmployees(eventId) {
    try {
      const shift = await getShiftById(eventId);
      if (shift && shift.employees) {
        const employeeIds = shift.employees.map(emp => emp.employeeId);
        setCurrentShiftEmployees(employeeIds);
        
        const employeeSelections = {};
        const employeesByRole = {};
        shift.employees.forEach(emp => {
          if (!employeesByRole[emp.role]) {
            employeesByRole[emp.role] = [];
          }
          employeesByRole[emp.role].push(emp.employeeId);
        });
        
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

  async function handleSubmit() {
    if (!validateAllPositionsFilled()) {
      return;
    }

    const currentShiftType = document.querySelector("#siftType").value;
    const selectedIds = getAllSelectedEmployeeIds();
    
    const uniqueIds = new Set(selectedIds);
    if (uniqueIds.size !== selectedIds.length) {
      setValidationError("The same employee cannot be assigned to multiple roles in the same shift.");
      return;
    }

    for (const employeeId of selectedIds) {
      if (!currentShiftEmployees.includes(employeeId) && 
          isEmployeeAssignedToSameShift(employeeId, selectedDate, currentShiftType)) {
        setValidationError(`One or more employees are already assigned to a ${currentShiftType.replace('_', ' ')} on this date.`);
        return;
      }
    }

    const [datePart, timePart] = selectedDate.split("T");
    let hour = timePart ? timePart.split(":")[0] : "00";
    let date = selectedDate;

    if (hour === "00") {
      date = `${datePart}T01:${timePart ? timePart.split(":")[1] : "00"}:${timePart ? timePart.split(":")[2] : "00"}:00`;
    }

    let eventId = selectedEvent.id;

    const newShift = {
      shiftType: document.querySelector("#siftType").value,
      area: document.querySelector("#area").value,
      date: Date.parse(date),
      employees: [],
    };

    newShift.id = eventId;

    Object.entries(staffingRules[selectedArea] || {}).forEach(([role, count]) => {
      for (let i = 0; i < count; i++) {
        const selectedValue = selectedEmployees[role]?.[i] || "";
        if (selectedValue) {
          newShift.employees.push({
            employeeId: selectedValue,
            role: role,
          });
        }
      }
    });

    if (eventId) {
      axios
        .put("http://localhost:3000/shifts", newShift)
        .then((response) => {
          setShowPopup(false);
          getShifts();
          processEmployeeAssignments();
        })
        .catch((error) => {
          console.error("Error updating shift:", error.response?.data || error);
        });
    } else {
      axios
        .post("http://localhost:3000/shifts", newShift)
        .then((response) => {
          setShowPopup(false);
          getShifts();
          processEmployeeAssignments();
        })
        .catch((error) => {
          console.error("Error adding shift:", error.response?.data || error);
        });
    }
    setSelectedEvent({});
    setCurrentShiftEmployees([]);
  }

  async function updateShift(eventDropInfo) {
    const newDate = eventDropInfo.event.end.toISOString().split("T")[0];
    let starTime = eventDropInfo.event.start.toString().split(" ")[4];
    let endTime = eventDropInfo.event.end.toString().split(" ")[4];

    if (
      (starTime === "00:00:01" && endTime === "08:00:00") ||
      (starTime === "08:00:01" && (endTime === "16:00:00" || endTime === "15:59:59")) ||
      (starTime === "16:00:01" && (endTime === "23:59:59" || endTime === "00:00:00"))
    ) {
      const shift = await getShiftById(eventDropInfo.event.id);
      if (!shift) return;

      if (starTime === "00:00:01") shift.shiftType = "Day_shift";
      else if (starTime === "08:00:01") shift.shiftType = "Evening_shift";
      else if (starTime === "16:00:01") shift.shiftType = "Night_shift";
      
      shift.date = newDate;

      if (verifyarea(shift, eventDropInfo.event.end.toISOString())) {
        eventDropInfo.revert();
        alert("Area already exists for this shift time");
        return;
      }

      const formattedDate = new Date(newDate).toISOString().split('T')[0];
      let conflictExists = false;
      const currentShiftEmpIds = shift.employees.map(emp => emp.employeeId);
      
      if (shift)
      if (shift.employees && shift.employees.length > 0) {
        for (const emp of shift.employees) {
          const key = `${formattedDate}-${shift.shiftType}-${emp.employeeId}`;
          if (employeeShiftAssignments[key]) {
            conflictExists = true;
            break;
          }
        }
      }
      
      if (conflictExists) {
        eventDropInfo.revert();
        alert("Cannot move shift: One or more employees are already assigned to the same shift type on the target date");
        return;
      }

      try {
        await axios.put("http://localhost:3000/shifts", shift);
        getShifts();
        processEmployeeAssignments();
      } catch (error) {
        console.error("Error modifying shift:", error.response?.data || error.message);
      }
    } else {
      eventDropInfo.revert();
    }
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
      if (element.id === shift._id) return false;
      return element.title == shift.area && shiftStartDate == element.start;
    });
  };

  async function handleAddEvent() {
    if (!validateAllPositionsFilled()) {
      return;
    }

    const currentShiftType = document.querySelector("#siftType").value;
    const selectedIds = getAllSelectedEmployeeIds();
    
    const uniqueIds = new Set(selectedIds);
    if (uniqueIds.size !== selectedIds.length) {
      setValidationError("The same employee cannot be assigned to multiple roles in the same shift.");
      return;
    }

    for (const employeeId of selectedIds) {
      if (isEmployeeAssignedToSameShift(employeeId, selectedDate, currentShiftType)) {
        setValidationError(`One or more employees are already assigned to a ${currentShiftType.replace('_', ' ')} on this date.`);
        return;
      }
    }

    const [datePart, timePart] = selectedDate.split("T");
    let hour = timePart ? timePart.split(":")[0] : "00";
    let date = selectedDate;

    if (hour === "00") {
      date = `${datePart}T01:${timePart ? timePart.split(":")[1] : "00"}:${timePart ? timePart.split(":")[2] : "00"}:00`;
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

    Object.entries(staffingRules[selectedArea] || {}).forEach(([role, count]) => {
      for (let i = 0; i < count; i++) {
        const selectedValue = selectedEmployees[role]?.[i] || "";
        if (selectedValue) {
          newShift.employees.push({
            employeeId: selectedValue,
            role: role,
          });
        }
      }
    });

    axios
      .post("http://localhost:3000/shifts", newShift)
      .then((response) => {
        setShowPopup(false);
        setValidationError("");
        getShifts();
        processEmployeeAssignments();
      })
      .catch((error) => {
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

      <Popup open={showPopup} onClose={() => setShowPopup(false)} modal>
        <div className="bg-white p-[15px] shadow-xl max-w-lg w-full mx-auto border border-gray-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Shift for {selectedDate.split("T")[0]}
          </h2>

          {validationError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{validationError}</p>
            </div>
          )}

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

          {selectedArea &&
            Object.entries(staffingRules[selectedArea] || {}).map(([role, count]) => (
              <div key={role} className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">
                  {role} ({count} required)
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {[...Array(count)].map((_, index) => {
                    const allSelectedIds = getAllSelectedEmployeeIds();
                    const currentValue = selectedEmployees[role]?.[index] || "";
                    
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
                          .map((employee) => {
                            const isDisabled = allSelectedIds.includes(employee._id) && 
                                             currentValue !== employee._id;
                            return (
                              <option
                                key={employee._id}
                                value={employee._id}
                                disabled={isDisabled}
                              >
                                {employee.name} {isDisabled ? "(Already selected)" : ""}
                              </option>
                            );
                          })}
                      </select>
                    );
                  })}
                </div>
              </div>
            ))}

          <div className="flex justify-between mt-4">
            {(
              <button
                type="button"
                onClick={handleAddEvent}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={!selectedArea}
              >
                Add Shift
              </button>
            )}

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
    return response.data;
  } catch (error) {
    console.error("Error fetching shift:", error.response?.data || error.message);
    return null;
  }
}

async function deleteShiftId(id) {
  try {
    const response = await axios.delete(`http://localhost:3000/shifts/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting shift:", error.response?.data || error.message);
    return null;
  }
}