import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import logo from "../../../public/assets/img/logoPI.png";
import { io } from "socket.io-client";


let socketInstance = null;

const Sidebar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [ambulanceNotifications, setAmbulanceNotifications] = useState(0);
  const [leaveNotifications, setLeaveNotifications] = useState(0);

 
  const menuItems = useMemo(() => ({
    receptionnist: [
      { to: "/AddPatient", icon: "bx bx-user-plus", label: "Add patient" },
      { to: "/showPatients", icon: "bx bx-group", label: "Show patients" },
      { 
        to: "/MyLeaveRequests", 
        icon: "fas fa-calendar-check", 
        label: "Leaves",
        
      },
      { 
        to: "/ambulance", 
        icon: "fa fa-ambulance", 
        label: "Ambulance",
        notifications: ambulanceNotifications
      },
      { to: "/messenger", icon: "bx bx-message", label: "Messenger" },

    ],
    triage_nurse: [
      { to: "/showTriagePatients", icon: "bx bx-group", label: "Show Triage patients" },
      { 
        to: "/MyLeaveRequests", 
        icon: "fas fa-calendar-check", 
        label: "Leaves",
        
      },
      { to: "/messenger", icon: "bx bx-message", label: "Messenger" },

    ],
    nurse: [
       { to: "/medical-treatments", icon: "bx bx-folder", label: "Medical Monitoring" },
      { 
        to: "/MyLeaveRequests", 
        icon: "fas fa-calendar-check", 
        label: "Leaves",
        
      },
      { to: "/messenger", icon: "bx bx-message", label: "Messenger" },

    ],
    doctor: [
      { to: "/profile", icon: "bx bx-user-plus", label: "My Patients" },
      { to: "/medical-treatments", icon: "bx bx-folder", label: "Medical Monitoring" },
      { to: "/messenger", icon: "bx bx-message", label: "Messenger" },

      { 
        to: "/MyLeaveRequests", 
        icon: "fas fa-calendar-check", 
        label: "Leaves",
        
      },
    ],
    admin: [
      { to: "/dashboard", icon: "bx bx-home-circle", label: "Dashboard" },
      { to: "/register", icon: "bx bx-user-plus", label: "Add Employee" },
      { to: "/users", icon: "bx bx-group", label: "Show Employees" },
      { to: "/areas", icon: "bx bx-building", label: "Areas" },
      { to: "/rooms", icon: "bx bx-home", label: "Rooms" },
      { to: "/equipments", icon: "bx bx-cog", label: "Equipment" },
      { to: "/messenger", icon: "bx bx-message", label: "Messenger" },

      { 
        to: "/statleaves", 
        icon: "fas fa-calendar-check", 
        label: "Leaves",
        notifications: leaveNotifications
      },

    ],
  }), [leaveNotifications, ambulanceNotifications]);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    
    if (!storedRole || !token) {
      navigate("/login");
      return;
    }

    setRole(storedRole);

   
    if (!socketInstance) {
      socketInstance = io("http://localhost:3000", {
        auth: { token },
        transports: ['websocket']
      });

     
      socketInstance.on("updateAmbulanceRequests", (count) => {
        setAmbulanceNotifications(count);
      });

      socketInstance.on("updateLeaveRequests", (count) => {
        setLeaveNotifications(count);
      });

      socketInstance.on("newLeaveRequest", ({ role: requesterRole }) => {
        if (storedRole === "admin" || requesterRole === storedRole) {
          fetchLeaveRequestsCount();
        }
      });

      socketInstance.on("leaveRequestUpdated", ({ status, employeeId }) => {
        if (storedRole === "admin" || employeeId === userId) {
          fetchLeaveRequestsCount();
        }
      });

      
      const fetchInitialData = async () => {
        try {
          const [ambulanceRes, leavesRes] = await Promise.all([
            fetch("http://localhost:3000/api/demandes/count", {
              headers: { Authorization: `Bearer ${token}` }
            }),
            fetch("http://localhost:3000/api/leaves/pending-count", {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);

          if (ambulanceRes.ok) {
            const data = await ambulanceRes.json();
            setAmbulanceNotifications(data.count || 0);
          }

          if (leavesRes.ok) {
            const data = await leavesRes.json();
            setLeaveNotifications(data.count || 0);
          }
        } catch (error) {
          console.error("Error fetching initial data:", error);
        }
      };

      fetchInitialData();
    }

    return () => {
      
    };
  }, [navigate]);

  const fetchLeaveRequestsCount = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/leaves/pending-count", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLeaveNotifications(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching leave requests count:", error);
    }
  };

  const handleLogout = () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    localStorage.clear();
    navigate("/login");
  };

  if (!role) {
    return null;
  }

  return (
    <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
      <div className="app-brand demo" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <img 
          src={logo} 
          alt="ED Logo" 
          className="app-brand-link app-brand-text demo menu-text fw-bolder ms-2" 
          style={{ width: "80%", height: "auto", objectFit: "contain" }} 
        />
        <NavLink className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">
          <i className="bx bx-chevron-left bx-sm align-middle" />
        </NavLink>
      </div>
      
      <div className="menu-inner-shadow" />
      
      <ul className="menu-inner py-1">
        {menuItems[role]?.map(({ to, icon, label, notifications }) => (
          <li className="menu-item" key={to}>
            <NavLink 
              to={to} 
              className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`}
              end
            >
              <i className={`menu-icon tf-icons ${icon}`} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <span>{label}</span>
                {notifications > 0 && (
                  <span className="notification-badge">{notifications}</span>
                )}
              </div>
            </NavLink>
          </li>
        ))}

        <li className='menu-item'>
          <NavLink 
            to='/profile' 
            className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`}
            end
          >   
            <i className='menu-icon tf-icons bx bx-user' />
            <div data-i18n='Analytics'>My profile</div>

          </NavLink>
          <NavLink 
            to='/shift' 
            className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`}
            end
          >   
            <i className='menu-icon tf-icons bx bx-calendar' />
            <div data-i18n='Analytics'>Shift</div>
            
          </NavLink>
        </li>
        
        <li className="menu-item">
          <button 
            onClick={handleLogout} 
            className="menu-link" 
            style={{ 
              background: "none", 
              border: "none", 
              cursor: "pointer", 
              display: "flex", 
              alignItems: "center", 
              width: "100%" 
            }}
          >
            <i className="menu-icon tf-icons bx bx-log-out" />
            <div>Log out</div>
          </button>
        </li>
      </ul>

      <style jsx>{`
        .notification-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          font-size: 12px;
          font-weight: bold;
          color: white;
          background-color: #ff3e1d;
          border-radius: 10px;
          margin-left: 8px;
        }
        
        .menu-link {
          position: relative;
          display: flex;
          align-items: center;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;

