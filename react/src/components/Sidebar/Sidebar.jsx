import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside id="layout-menu" className="layout-menu menu-vertical menu bg-menu-theme">
      <div className="app-brand demo">
        <NavLink to="/" className="app-brand-link">
          <span className="app-brand-text demo menu-text fw-bolder ms-2">Sneat</span>
        </NavLink>

        <NavLink className="layout-menu-toggle menu-link text-large ms-auto d-block d-xl-none">
          <i className="bx bx-chevron-left bx-sm align-middle"></i>
        </NavLink>
      </div>

      <div className="menu-inner-shadow"></div>

      <ul className="menu-inner py-1">
        <li className="menu-item">
          <NavLink 
            to="/" 
            className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
          >
            <i className="menu-icon tf-icons bx bx-home-circle"></i>
            <div data-i18n="Analytics">Dashboard</div>
          </NavLink>
        </li>
        <li className="menu-item">
          <NavLink 
            to="/register" 
            className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
          >
            <i className="menu-icon tf-icons bx bx-home-circle"></i>
            <div data-i18n="Analytics">Register</div>
          </NavLink>
        </li>
        <li className="menu-item">
          <NavLink 
            to="/login" 
            className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}
          >
            <i className="menu-icon tf-icons bx bx-home-circle"></i>
            <div data-i18n="Analytics">Login</div>
          </NavLink>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
