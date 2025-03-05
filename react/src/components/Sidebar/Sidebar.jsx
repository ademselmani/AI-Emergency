import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../../public/assets/img/logoPI.png"; // Adjust the path accordingly
const Sidebar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      navigate("/login");
    } else {
      setRole(role);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside
      id="layout-menu"
      className="layout-menu menu-vertical menu bg-menu-theme"
    >
       <div
      className="app-brand demo"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: "auto",
      }}
    >
      <img
        src={logo}
        alt="ED Logo"
        className="app-brand-link app-brand-text demo menu-text fw-bolder ms-2"
        style={{
          width: "80%", // Make the image take up full width
          height: "auto", // Maintain aspect ratio
          objectFit: "contain", // Ensure the image scales without stretching
        }}
      />
      <NavLink
        className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none"
        style={{ textDecoration: "none" }} // Add any specific styles for this link
      >
        <i className="bx bx-chevron-left bx-sm align-middle"></i>
      </NavLink>
    </div>

      <div className="menu-inner-shadow"></div>

      <ul className="menu-inner py-1">
        {/* Dashboard */}
        {role === "admin" && ( <> <li className="menu-item">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `menu-link ${isActive ? "active" : ""}`
            }
          >
            <i className="menu-icon tf-icons bx bx-home-circle"></i>
            <div data-i18n="Analytics">Dashboard</div>
          </NavLink>
        </li> </> )}




            
        {role === "doctor" && (
          <>
            <li className="menu-item">
              <NavLink
                to="/medical-treatments"
                className={({ isActive }) =>
                  `menu-link ${isActive ? "active" : ""}`
                }
              >
                <i className="menu-icon tf-icons bx bx-capsule"></i>
                <div data-i18n="Analytics">Medical treatments</div>
              </NavLink>
            </li>
          </>
        )}

{role === "nurse" && (
          <>
            <li className="menu-item">
              <NavLink
                to="/medical-treatments"
                className={({ isActive }) =>
                  `menu-link ${isActive ? "active" : ""}`
                }
              >
                <i className="menu-icon tf-icons bx bx-capsule"></i>
                <div data-i18n="Analytics">Medical treatments</div>
              </NavLink>
            </li>
          </>
        )}

{role === "admin" && (
          <>
            <li className="menu-item">
              <NavLink
                to="/medical-treatments"
                className={({ isActive }) =>
                  `menu-link ${isActive ? "active" : ""}`
                }
              >
                <i className="menu-icon tf-icons bx bx-capsule"></i>
                <div data-i18n="Analytics">Medical treatments</div>
              </NavLink>
            </li>
          </>
        )}
        {role === "Doctor" && (
          <>
            <li className="menu-item">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `menu-link ${isActive ? "active" : ""}`
                }
              >
                <i className="menu-icon tf-icons bx bx-user-plus"></i>
                <div data-i18n="Analytics">My Patients</div>
              </NavLink>
            </li>
          </>
        )}




        {/* Conditionally render Add Employee */}
        {role === "admin" && (
          <>
            <li className="menu-item">
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `menu-link ${isActive ? "active" : ""}`
                }
              >
                <i className="menu-icon tf-icons bx bx-user-plus"></i>
                <div data-i18n="Analytics">Add Employee</div>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `menu-link ${isActive ? "active" : ""}`
                }
              >
                <i className="menu-icon tf-icons bx bx-group"></i>
                <div data-i18n="Analytics">Show Employees</div>
              </NavLink>
            </li>
          </>
        )}

        {role === "receptionnist" && (
          <>
            <li className="menu-item">
              <NavLink
                to="/AddPatient"
                className={({ isActive }) =>
                  `menu-link ${isActive ? "active" : ""}`
                }
              >
                <i className="menu-icon tf-icons bx bx-user-plus"></i>
                <div data-i18n="Analytics">Add patient</div>
              </NavLink>
            </li>
            <li className="menu-item">
              <NavLink
                to="/showPatients"
                className={({ isActive }) =>
                  `menu-link ${isActive ? "active" : ""}`
                }
              >
                <i className="menu-icon tf-icons bx bx-group"></i>
                <div data-i18n="Analytics">Show patients</div>
              </NavLink>
            </li>
          </>
        )}

        {role === "Triage-nurse" && (
          <>
            <li className="menu-item">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `menu-link ${isActive ? "active" : ""}`
                }
              >
                <i className="menu-icon tf-icons bx bx-user-plus"></i>
                <div data-i18n="Analytics">Triage Patients</div>
              </NavLink>
            </li>
          </>
        )}

        {role === "nurse" && (
          <>
            <li className="menu-item">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `menu-link ${isActive ? "active" : ""}`
                }
              >
                <i className="menu-icon tf-icons bx bx-user-plus"></i>
                <div data-i18n="Analytics">Patients in my area</div>
              </NavLink>
            </li>
          </>
        )}

        {role === "Doctor" && (
          <>
            <li className="menu-item">
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `menu-link ${isActive ? "active" : ""}`
                }
              >
                <i className="menu-icon tf-icons bx bx-user-plus"></i>
                <div data-i18n="Analytics">My Patients</div>
              </NavLink>
            </li>
          </>
        )}

        <li className="menu-item">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `menu-link ${isActive ? "active" : ""}`
            }
          >
            <i className="menu-icon tf-icons bx bx-user"></i>
            <div data-i18n="Analytics">My profile</div>
          </NavLink>
        </li>

        {/* Log out */}
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
              width: "100%",
            }}
          >
            <i className="menu-icon tf-icons bx bx-log-out"></i>
            <div data-i18n="Analytics">Log out</div>
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
