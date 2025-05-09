import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
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
    ],
    triage_nurse: [
      { to: "/showTriagePatients", icon: "bx bx-group", label: "Triage patients" },
      { 
        to: "/MyLeaveRequests", 
        icon: "fas fa-calendar-check", 
        label: "Leaves",
        
      },
    ],
    nurse: [
       { to: "/medical-treatments", icon: "bx bx-folder", label: "Medical Monitoring" },
      { 
        to: "/MyLeaveRequests", 
        icon: "fas fa-calendar-check", 
        label: "Leaves",
        
      },
    ],
    doctor: [
       { to: "/medical-treatments", icon: "bx bx-folder", label: "Medical Monitoring" },
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
    <motion.aside 
      id="layout-menu"
      className="layout-menu menu-vertical menu"
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="glass-brand">
        <img 
          src={logo} 
          alt="ED Logo" 
          className="sidebar-logo"
        />
        
      </div>
      
    

      <ul className="menu-inner">
        {menuItems[role]?.map(({ to, icon, label, notifications }) => (
          <motion.li 
            className="menu-item"
            key={to}
            whileHover={{ scale: 1.02 }}
          >
            <NavLink 
              to={to} 
              className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`}
              end
            >
              <i className={`menu-icon ${icon}`} />
              <div className="link-content">
                <span>{label}</span>
                {notifications > 0 && (
                  <span className="notification-badge">{notifications}</span>
                )}
              </div>
            </NavLink>
          </motion.li>
        ))}

        <div className="menu-divider" />

        <li className='menu-item'>
          <NavLink 
            to='/profile' 
            className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`}
          >   
            <i className='menu-icon bx bx-user' />
            <div>My profile</div>
          </NavLink>
        </li>

        <li className='menu-item'>
          <NavLink 
            to='/shift' 
            className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`}
          >   
            <i className='menu-icon bx bx-calendar' />
            <div>Shift</div>
          </NavLink>
        </li>

        <div className="menu-divider" />

        <motion.li 
          className="menu-item"
          whileTap={{ scale: 0.95 }}
        >
          <button 
            onClick={handleLogout} 
            className="logout-button"
          >
            <i className="menu-icon bx bx-log-out" />
            <div>Log out</div>
          </button>
        </motion.li>
      </ul>

      <style jsx>{`
        .layout-menu {
          background: f5f5f9
          backdrop-filter: blur(10px);
          width: 280px;
          min-height: 100vh;
          box-shadow: 4px 0 15px rgba(0, 0, 0, 0.05);
          border-right: 1px solid rgba(255, 255, 255, 0.3);
          padding: 1rem;
        }

        .glass-brand {
          display: flex;
          justify-content: center;
          padding: 0.5rem ;
          margin: 0.5rem 0;
        }

        .sidebar-logo {
          height: 50px;
          width: auto;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
        }

        .app-name {
          font-size: 1.4rem;
          font-weight: 700;
          color: #ff3b3f;
          letter-spacing: -0.5px;
        }

        .menu-divider {
          height: 1px;
          background: rgba(0, 0, 0, 0.1);
          margin: 1rem 0;
        }

        .menu-item {
          margin: 0.25rem 0;
          border-radius: 8px;
          overflow: hidden;
        }

        .menu-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.9rem 1.2rem;
          color: #2d2d2d;
          transition: all 0.2s ease;
          position: relative;
        }

        .menu-link:hover {
          background: rgba(255, 59, 63, 0.05);
          color: #ff3b3f;
        }

        .menu-link.active {
          background: rgba(255, 59, 63, 0.1);
          color: #ff3b3f;
          border-left: 3px solid #ff3b3f;
        }

        .menu-icon {
          font-size: 1.4rem;
          width: 30px;
          display: flex;
          justify-content: center;
        }

        .link-content {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
        }
        .link-content span:first-child {
          margin-right: 12px; 
        }


        .notification-badge {
          background: #ff3b3f;
          color: white;
          min-width: 24px;
          height: 24px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0 0.5rem;
          box-shadow: 0 2px 6px rgba(255, 59, 63, 0.2);
          margin-left: auto;
        }

        .logout-button {
          width: 100%;
          background: none;
          border: none;
          padding: 0.9rem 1.2rem;
          color: #2d2d2d;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .logout-button:hover {
          background: rgba(255, 59, 63, 0.05);
          color: #ff3b3f;
        }

        @media (max-width: 768px) {
          .layout-menu {
            width: 240px;
            padding: 0.5rem;
          }
          
          .glass-brand {
            padding: 1rem;
          }
          
          .app-name {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </motion.aside>
  );
};

export default Sidebar;