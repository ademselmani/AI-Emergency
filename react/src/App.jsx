import React from "react"; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css"; // Global styles
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Authentification/Login";
import Profile from "./pages/Profile/Profile";
import Register from "./pages/Authentification/Resgister"; 
import ResetPassword from "./pages/Authentification/ResetPassword";
import Passwordforget from "./pages/Authentification/Passwordforget";
import NotFound from "./pages/Exceptions/NotFound";
import Layout from "./layout/Layout";
import Head from "./components/head";
import FaceRecognition from "./pages/Authentification/FaceRecognition"; // Importer la page de reconnaissance faciale
/** @format */




import "./App.css" // Style global



import EmployeeStats from "./pages/stats/statistique"
import ListeEmployees from "./pages/listeEmployees/listeEmployees"
import EmployeesDetails from "./pages/listeEmployees/EmployeesDetails"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-icons/font/bootstrap-icons.css"
import "bootstrap/dist/js/bootstrap.bundle.min.js"
import "@fortawesome/fontawesome-free/css/all.min.css"

function App() {
  return (
    <>
      <Head />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* Routes protégées (wrappées dans Layout) */}
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/reset/:token" element={<ResetPassword />} />
          <Route path="/forget-password" element={<Passwordforget />} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          {/* Ajouter la route pour la reconnaissance faciale */}
          <Route path="/face-recognition" element={<FaceRecognition />} />
          {/* 404 - Page non trouvée */}
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </Router>
    </>
  );
}


        <Layout>
          <Routes>
            <Route path='/' element={<EmployeeStats />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            {/* Route indépendante pour EmployeesDetails */}
            <Route path='/user' element={<ListeEmployees />} />
            <Route path='/user/profile/:id' element={<EmployeesDetails />} />
            <Route path='*' element={<NotFound />} /> {/* Page 404 */}
          </Routes>
        </Layout>
     
  

export default App
