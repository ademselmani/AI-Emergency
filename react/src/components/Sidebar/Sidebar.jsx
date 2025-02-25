import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const role = localStorage.getItem("role");

  return (
    <aside
      id="layout-menu"
      className="layout-menu menu-vertical menu bg-menu-theme"
    >
      <div className="app-brand demo">
        <NavLink to="/" className="app-brand-link">
          <span className="app-brand-text demo menu-text fw-bolder ms-2">
            Sneat
          </span>
        </NavLink>

        <NavLink className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">
          <i className="bx bx-chevron-left bx-sm align-middle"></i>
        </NavLink>
      </div>

      <div className="menu-inner-shadow"></div>

      <ul className="menu-inner py-1">
        {/* Dashboard */}
        <li className="menu-item">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `menu-link ${isActive ? "active" : ""}`
            }
          >
            <i className="menu-icon tf-icons bx bx-home-circle"></i>
            <div data-i18n="Analytics">Dashboard</div>
          </NavLink>
        </li>

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
                to="/showPatients"
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
                to="/showPatients"
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
                to="/showPatients"
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
            to="/myprofile"
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
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `menu-link ${isActive ? "active" : ""}`
            }
          >
            <i className="menu-icon tf-icons bx bx-log-out"></i>
            <div data-i18n="Analytics">Log out</div>
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
