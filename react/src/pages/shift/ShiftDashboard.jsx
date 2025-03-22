import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Popup from "reactjs-popup";
import { useState } from "react";

const events = [{ title: "Meeting", start: new Date() }];

export function ShiftDashboard() {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  function handleDateSelect(selectInfo) {
    setSelectedDate(selectInfo.startStr);
    setShowPopup(true);
  }

  return (
    <div>
      <h1>Demo App</h1>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        weekends={false}
        events={events}
        eventContent={renderEventContent}
        dateClick={handleDateSelect}
      />

      {/* Popup */}
      <Popup open={showPopup} onClose={() => setShowPopup(false)} modal>
        <div>
          <h2>Selected Date: {selectedDate}</h2>
          <p>Popup content here !!</p>
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
