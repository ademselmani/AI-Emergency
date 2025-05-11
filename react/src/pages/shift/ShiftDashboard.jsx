import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import Popup from "reactjs-popup";
import { useState, useEffect } from "react";
import axios from "axios";
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

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
  const [roleInputCounts, setRoleInputCounts] = useState({}); // Track number of input fields per role

  function handleDateSelect(selectInfo) {
    if(localStorage.getItem("role") != "admin") return
    setSelectedDate(selectInfo.dateStr);
    setShowPopup(true);
    setSelectedEmployees({});
    setRoleInputCounts({}); // Reset input counts
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
    const hour = startTime.split("T")[1].substring(0, 2);
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
        const date = new Date(shift.date).toISOString().split("T")[0];
        const shiftType = shift.shiftType;

        if (selectedEvent.id === shift._id) continue;

        if (shift.employees && shift.employees.length > 0) {
          shift.employees.forEach((emp) => {
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
      let formattedShifts;
      if ("admin" == localStorage.getItem("role")) {
        formattedShifts = response.data.map((shift) => {
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
      } else {
        formattedShifts = response.data
          .filter((shift) =>
            shift.employees.some(
              (employee) => employee.employeeId == localStorage.getItem("user_id")
            )
          )
          .map((shift) => {
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
      }
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
    Object.values(selectedEmployees).forEach((roleSelections) => {
      Object.values(roleSelections).forEach((id) => {
        if (id) allSelectedIds.push(id);
      });
    });
    return allSelectedIds;
  };

  const isEmployeeAssignedToSameShift = (employeeId, date, shiftType) => {
    const datePart = date.split("T")[0];
    const key = `${datePart}-${shiftType}-${employeeId}`;

    if (currentShiftEmployees.includes(employeeId)) {
      return false;
    }

    return employeeShiftAssignments[key] === true;
  };

  const validateMinimumPositionsFilled = () => {
    if (!selectedArea) {
      setValidationError("Please select an area");
      return false;
    }

    const areaRules = staffingRules[selectedArea];
    if (!areaRules) return true;

    let allMinimumFilled = true;
    let missingPositions = [];

    Object.entries(areaRules).forEach(([role, minCount]) => {
      const filledCount = Object.values(selectedEmployees[role] || {}).filter(id => id).length;
      if (filledCount < minCount) {
        allMinimumFilled = false;
        missingPositions.push(`${role} (at least ${minCount} required, ${filledCount} filled)`);
      }
    });

    if (!allMinimumFilled) {
      setValidationError(
        `Please fill the minimum required positions: ${missingPositions.join(", ")}`
      );
    } else {
      setValidationError("");
    }

    return allMinimumFilled;
  };

  function handleEmployeeSelection(role, index, value) {
    const currentShiftType = document.querySelector("#siftType").value;

    if (
      value &&
      isEmployeeAssignedToSameShift(value, selectedDate, currentShiftType)
    ) {
      setValidationError(
        `This employee is already assigned to a ${currentShiftType.replace(
          "_",
          " "
        )} on this date.`
      );
      return;
    }

    const allSelectedIds = getAllSelectedEmployeeIds();
    if (
      value &&
      allSelectedIds.includes(value) &&
      selectedEmployees[role]?.[index] !== value
    ) {
      setValidationError(
        "This employee is already selected for another role in this shift."
      );
      return;
    }

    setSelectedEmployees((prev) => ({
      ...prev,
      [role]: { ...(prev[role] || {}), [index]: value },
    }));

    setValidationError("");
  }

  function handleAddEmployeeField(role, minCount) {
    setRoleInputCounts((prev) => ({
      ...prev,
      [role]: (prev[role] || minCount) + 1,
    }));
  }

  function handleRemoveEmployeeField(role, index, minCount) {
    if ((roleInputCounts[role] || minCount) <= minCount) return; // Prevent removing below minimum

    setRoleInputCounts((prev) => ({
      ...prev,
      [role]: (prev[role] || minCount) - 1,
    }));

    setSelectedEmployees((prev) => {
      const updatedRole = { ...(prev[role] || {}) };
      delete updatedRole[index];
      return {
        ...prev,
        [role]: updatedRole,
      };
    });
  }

  function handleEventClick(eventClickInfo) {
    if(localStorage.getItem("role") != "admin") return
    setSelectedEmployees({});
    setRoleInputCounts({}); // Reset input counts
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
        const employeeIds = shift.employees.map((emp) => emp.employeeId);
        setCurrentShiftEmployees(employeeIds);

        const employeeSelections = {};
        const employeesByRole = {};
        const roleCounts = {};

        shift.employees.forEach((emp) => {
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
          roleCounts[role] = ids.length;
        });

        setSelectedEmployees(employeeSelections);
        setRoleInputCounts(roleCounts);
      }
    } catch (error) {
      console.error("Error loading existing employees:", error);
    }
  }

  async function handleSubmit() {
    if (!validateMinimumPositionsFilled()) {
      return;
    }

    const currentShiftType = document.querySelector("#siftType").value;
    const selectedIds = getAllSelectedEmployeeIds();

    const uniqueIds = new Set(selectedIds);
    if (uniqueIds.size !== selectedIds.length) {
      setValidationError(
        "The same employee cannot be assigned to multiple roles in the same shift."
      );
      return;
    }

    for (const employeeId of selectedIds) {
      if (
        !currentShiftEmployees.includes(employeeId) &&
        isEmployeeAssignedToSameShift(
          employeeId,
          selectedDate,
          currentShiftType
        )
      ) {
        setValidationError(
          `One or more employees are already assigned to a ${currentShiftType.replace(
            "_",
            " "
          )} on this date.`
        );
        return;
      }
    }

    const [datePart, timePart] = selectedDate.split("T");
    let hour = timePart ? timePart.split(":")[0] : "00";
    let date = selectedDate;

    if (hour === "00") {
      date = `${datePart}T01:${timePart ? timePart.split(":")[1] : "00"}:${
        timePart ? timePart.split(":")[2] : "00"
      }:00`;
    }

    let eventId = selectedEvent.id;

    const newShift = {
      shiftType: document.querySelector("#siftType").value,
      area: document.querySelector("#area").value,
      date: Date.parse(date),
      employees: [],
    };

    newShift.id = eventId;

    Object.entries(staffingRules[selectedArea] || {}).forEach(
      ([role, _]) => {
        const roleSelections = selectedEmployees[role] || {};
        Object.entries(roleSelections).forEach(([index, employeeId]) => {
          if (employeeId) {
            newShift.employees.push({
              employeeId: employeeId,
              role: role,
            });
          }
        });
      }
    );

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
    if(localStorage.getItem("role") != "admin") return

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

      const formattedDate = new Date(newDate).toISOString().split("T")[0];
      let conflictExists = false;
      const currentShiftEmpIds = shift.employees.map((emp) => emp.employeeId);

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
        alert(
          "Cannot move shift: One or more employees are already assigned to the same shift type on the target date"
        );
        return;
      }

      try {
        await axios.put("http://localhost:3000/shifts", shift);
        getShifts();
        processEmployeeAssignments();
      } catch (error) {
        console.error(
          "Error modifying shift:",
          error.response?.data || error.message
        );
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
    if (!validateMinimumPositionsFilled()) {
      return;
    }

    const currentShiftType = document.querySelector("#siftType").value;
    const selectedIds = getAllSelectedEmployeeIds();

    const uniqueIds = new Set(selectedIds);
    if (uniqueIds.size !== selectedIds.length) {
      setValidationError(
        "The same employee cannot be assigned to multiple roles in the same shift."
      );
      return;
    }

    for (const employeeId of selectedIds) {
      if (
        isEmployeeAssignedToSameShift(
          employeeId,
          selectedDate,
          currentShiftType
        )
      ) {
        setValidationError(
          `One or more employees are already assigned to a ${currentShiftType.replace(
            "_",
            " "
          )} on this date.`
        );
        return;
      }
    }

    const [datePart, timePart] = selectedDate.split("T");
    let hour = timePart ? timePart.split(":")[0] : "00";
    let date = selectedDate;

    if (hour === "00") {
      date = `${datePart}T01:${timePart ? timePart.split(":")[1] : "00"}:${
        timePart ? timePart.split(":")[2] : "00"
      }:00`;
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

    Object.entries(staffingRules[selectedArea] || {}).forEach(
      ([role, _]) => {
        const roleSelections = selectedEmployees[role] || {};
        Object.entries(roleSelections).forEach(([index, employeeId]) => {
          if (employeeId) {
            newShift.employees.push({
              employeeId: employeeId,
              role: role,
            });
          }
        });
      }
    );

    axios
      .post("http://localhost:3000/shifts", newShift)
      .then((response) => {
        setShowPopup(false);
        setValidationError("");
        getShifts();
        processEmployeeAssignments();
      })
      .catch((error) => {
        setValidationError(
          "Error adding shift: " +
            (error.response?.data?.error || "Unknown error")
        );
      });
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          weekends={true}
          events={shifts}
          editable={localStorage.getItem("role") == "admin"}
          eventDrop={updateShift}
          eventContent={renderEventContent}
          dateClick={handleDateSelect}
          eventClick={handleEventClick}
          themeSystem="standard"
          height="auto"
          dayHeaderClassNames="bg-white text-[#ff3b3f] font-semibold py-2"
          dayCellClassNames="bg-white text-[#ff3b3f] transition-colors"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
          }}
          eventClassNames="!rounded-lg !border-0 !text-sm !shadow-sm"
        />
      </div>

      <Popup
        open={showPopup}
        onClose={() => setShowPopup(false)}
        modal
        nested
        contentStyle={{ borderRadius: '1rem', border: 'none' }}
      >
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-xl w-full mx-auto relative">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Shift Planning<br />
              <span className="text-lg text-gray-600">{selectedDate.split("T")[0]}</span>
            </h2>
            <button
              onClick={() => setShowPopup(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-2"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {validationError && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-center gap-3 text-red-700">
              <span className="text-sm font-medium">{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Shift Type</label>
              <select
                id="siftType"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                onChange={(e) => setselectedShiftType(e.target.value)}
                value={selectedShiftType}
              >
                <option value="Day_shift">Day Shift</option>
                <option value="Evening_shift">Evening Shift</option>
                <option value="Night_shift">Night Shift</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
              <select
                id="area"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                onChange={(e) => {
                  setSelectedArea(e.target.value);
                  setSelectedEmployees({});
                  setRoleInputCounts({}); // Reset input counts when area changes
                  setValidationError("");
                }}
                value={selectedArea}
              >
                <option value="">Select an area</option>
                <option value="Triage">Triage</option>
                <option value="Resuscitation">Resuscitation</option>
                <option value="Major_Trauma">Major Trauma</option>
                <option value="General_ED">General ED</option>
              </select>
            </div>
          </div>

          {selectedArea && Object.entries(staffingRules[selectedArea] || {}).map(([role, minCount]) => {
            const inputCount = roleInputCounts[role] || minCount;
            return (
              <div key={role} className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-900">{role}</span>
                  <span className="text-sm text-gray-500">{minCount} minimum required</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {[...Array(inputCount)].map((_, index) => {
                    const allSelectedIds = getAllSelectedEmployeeIds();
                    const currentValue = selectedEmployees[role]?.[index] || "";

                    return (
                      <div key={index} className="flex items-center gap-2">
                        <select
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                          value={currentValue}
                          onChange={(e) =>
                            handleEmployeeSelection(role, index, e.target.value)
                          }
                        >
                          <option value="">Select {role}</option>
                          {activeEmployees
                            .filter((employee) => employee.role === role)
                            .map((employee) => {
                              const isDisabled =
                                allSelectedIds.includes(employee._id) &&
                                currentValue !== employee._id;
                              return (
                                <option
                                  key={employee._id}
                                  value={employee._id}
                                  disabled={isDisabled}
                                >
                                  {employee.name}{" "}
                                  {isDisabled ? "(Already selected)" : ""}
                                </option>
                              );
                            })}
                        </select>
                        {index >= minCount && (
                          <button
                            type="button"
                            onClick={() => handleRemoveEmployeeField(role, index, minCount)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                          >
                            <MinusIcon className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => handleAddEmployeeField(role, minCount)}
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-all"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add {role}
                </button>
              </div>
            );
          })}

          <div className="flex flex-col gap-3 mt-8">
            {!showDeleteButton ? (
              <button
                onClick={handleAddEvent}
                className="w-full py-4 px-6 bg-[#ff3b3f] text-white p-4 rounded hover:bg-red-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={!selectedArea}
              >
                <PlusIcon className="w-5 h-5" />
                Create Shift
              </button>
            ) : (
              <>
                <button
                  onClick={handleSubmit}
                  className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <PencilIcon className="w-5 h-5" />
                  Update Shift
                </button>
                <button
                  onClick={handleDeleteEvent}
                  className="w-full py-4 px-6 bg-[#ff3b3f] text-white p-4 rounded hover:bg-red-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <TrashIcon className="w-5 h-5" />
                  Delete Shift
                </button>
              </>
            )}
          </div>
        </div>
      </Popup>
    </div>
  );
}

function renderEventContent(eventInfo) {
  const areaColors = {
    Triage: 'bg-blue-100 text-blue-800',
    Resuscitation: 'bg-red-100 text-red-800',
    Major_Trauma: 'bg-amber-100 text-amber-800',
    General_ED: 'bg-emerald-100 text-emerald-800'
  };

  return (
    <div className={`p-2 ${areaColors[eventInfo.event.title]} rounded-lg text-sm font-medium`}>
      <div className="text-xs opacity-75 mb-1">{eventInfo.timeText}</div>
      <div>{eventInfo.event.title}</div>
    </div>
  );
}

async function getShiftById(id) {
  try {
    const response = await axios.get(`http://localhost:3000/shifts/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching shift:",
      error.response?.data || error.message
    );
    return null;
  }
}

async function deleteShiftId(id) {
  try {
    const response = await axios.delete(`http://localhost:3000/shifts/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting shift:",
      error.response?.data || error.message
    );
    return null;
  }
}