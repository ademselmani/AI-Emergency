import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css"; // Global styles
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Authentification/Login";
import Profile from "./pages/Profile/AuthentificatedUserprofile";
import Register from "./pages/Authentification/Resgister";
import ResetPassword from "./pages/Authentification/ResetPassword";
import Passwordforget from "./pages/Authentification/Passwordforget";
import NotFound from "./pages/Exceptions/NotFound";
import Layout from "./layout/Layout";
import Head from "./components/head";
import FaceRecognition from "./pages/Authentification/FaceRecognition"; // Importer la page de reconnaissance faciale
/** @format */
import "./App.css"; // Style global
import ListePatients from "./pages/receptionnist/ListePatients";
import ListePatientTriage from "./pages/Triage-nurse/ListePatientTriage";
import AddPatientForm from "./pages/receptionnist/AddPatientForm";
import UpdatePatientTriage from "./pages/Triage-nurse/UpdatePatientTriage";

import EmployeeStats from "./pages/stats/statistique";
import ListeEmployees from "./pages/listeEmployees/listeEmployees";
import UpdatePatientForm from "./pages/receptionnist/UpdatePatientForm"
import EmployeesDetails from "./pages/listeEmployees/EmployeesDetails";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  return (
    <>
      <Head />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          {/* Routes protégées (wrappées dans Layout) */}
          <Route
            path="/dashboard"
            element={
              <Layout>
                <EmployeeStats />
              </Layout>
            }
          />
          <Route
            path="/users"
            element={
              <Layout>
                <ListeEmployees />
              </Layout>
            }
          />
<Route
  path="/Addpatient"
  element={
    <Layout>
      <AddPatientForm />
    </Layout>
  }
/>
<Route
  path="/showPatients"
  element={
    <Layout>
      <ListePatients/>
    </Layout>
  }
/>
<Route path="/UpdatePatient/:id" element={<UpdatePatientForm />} />
<Route path="/UpdatePatientTriage/:id" element={<UpdatePatientTriage />} />

          <Route
            path="/register"
            element={
              <Layout>
                <Register />
              </Layout>
            }
          />
          <Route path="/reset/:token" element={<ResetPassword />} />
          <Route path="/forget-password" element={<Passwordforget />} />
          <Route
            path="/profile"
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />
          {/* Ajouter la route pour la reconnaissance faciale */}
          <Route path="/face-recognition" element={<FaceRecognition />} />
          {/* 404 - Page non trouvée */}
          {/* <Route
            path="*"
            element={
              <Layout>
                <NotFound />
              </Layout>
            }
          /> */}
          {/* <Route path="/" element={<Layout> <EmployeeStats /> </Layout>} /> */}
          {/* Route indépendante pour EmployeesDetails */}
          <Route
            path="/user"
            element={
              <Layout>
                <ListeEmployees />
              </Layout>
            }
          />
          <Route
            path="/user/profile/:id"
            element={
              <Layout>
                <EmployeesDetails />
              </Layout>
            }
          />
<Route path="/showTriagePatients" element={<ListePatientTriage filterByTriage={true} />} />

          <Route path="*" element={<NotFound />} /> {/* Page 404 */}
        </Routes>
        ;
      </Router>
    </>
    
  );
}

export default App;
