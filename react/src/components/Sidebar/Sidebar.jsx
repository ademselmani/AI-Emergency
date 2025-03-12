/** @format */

import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../../public/assets/img/logoPI.png"; // Adjust the path accordingly

const Sidebar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (!storedRole) {
      navigate("/login");
    } else {
      setRole(storedRole);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = {
    receptionnist: [
      { to: "/AddPatient", icon: "bx bx-user-plus", label: "Add patient" },
      { to: "/showPatients", icon: "bx bx-group", label: "Show patients" },
      { to: "/MyLeaveRequests", icon: "fas fa-calendar-check", label: "Leaves" },

    ],
    triage_nurse: [
      { to: "/ModifyStatus", icon: "bx bx-user-plus", label: "Do the sorting" },
      { to: "/showTriagePatients", icon: "bx bx-group", label: "Show Triage patients" },
      { to: "/MyLeaveRequests", icon: "fas fa-calendar-check", label: "Leaves" },

    ],
    nurse: [
      { to: "/profile", icon: "bx bx-user-plus", label: "Patients in my area" },
      { to: "/medical-treatments", icon: "bx bx-folder", label: "Medical Monitoring" },
      { to: "/MyLeaveRequests", icon: "fas fa-calendar-check", label: "Leaves" },

    ],
    Doctor: [
      { to: "/profile", icon: "bx bx-user-plus", label: "My Patients" },
      { to: "/medical-treatments", icon: "bx bx-folder", label: "Medical Monitoring" },
      { to: "/MyLeaveRequests", icon: "fas fa-calendar-check", label: "Leaves" },
    ],
    admin: [
      { to: "/dashboard", icon: "bx bx-home-circle", label: "Dashboard" },
      { to: "/register", icon: "bx bx-user-plus", label: "Add Employee" },
      { to: "/users", icon: "bx bx-group", label: "Show Employees" },
      { to: "/areas", icon: "bx bx-building", label: "Areas" },
      { to: "/rooms", icon: "bx bx-home", label: "Rooms" },
      { to: "/equipments", icon: "bx bx-cog", label: "Equipment" },
      { to: "/statleaves", icon: "fas fa-calendar-check", label: "Leaves" },
    ],
  };

  return (
    <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
      <div className="app-brand demo" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <img src={logo} alt="ED Logo" className="app-brand-link app-brand-text demo menu-text fw-bolder ms-2" style={{ width: "80%", height: "auto", objectFit: "contain" }} />
        <NavLink className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">
          <i className="bx bx-chevron-left bx-sm align-middle"></i>
        </NavLink>
      </div>
      <div className="menu-inner-shadow"></div>
      <ul className="menu-inner py-1">
        {role && menuItems[role]?.map(({ to, icon, label }) => (
          <li className="menu-item" key={to}>
            <NavLink to={to} className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`}>
              <i className={`menu-icon tf-icons ${icon}`}></i>
              <div>{label}</div>
            </NavLink>
          </li>
        ))}
        <li className="menu-item">
          <button onClick={handleLogout} className="menu-link" style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", width: "100%" }}>
            <i className="menu-icon tf-icons bx bx-log-out"></i>
            <div>Log out</div>
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;