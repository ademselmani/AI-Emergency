import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css"; // Global styles
import Login from "./pages/Authentification/Login";
import Profile from "./pages/Profile/AuthentificatedUserprofile";
import Register from "./pages/Authentification/Resgister";
import ResetPassword from "./pages/Authentification/ResetPassword";
import Passwordforget from "./pages/Authentification/Passwordforget";

import NotFound from "./pages/Exceptions/NotFound";
import Layout from "./layout/Layout";
import Head from "./components/head";
 // Importer la page de reconnaissance faciale
 import FaceRecognition from "./pages/Authentification/FaceRecognition"; 
// Importer la page de reconnaissance faciale
//import LeaveRequestForm from "./pages/Leaves/LeaveRequestForm";
/** @format */

import "./App.css"; // Style global
 
import EmployeeStats from "./pages/stats/statistique";
import ListeEmployees from "./pages/listeEmployees/listeEmployees";
import EmployeesDetails from "./pages/listeEmployees/EmployeesDetails";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@fortawesome/fontawesome-free/css/all.min.css";
 import "semantic-ui-css/semantic.min.css";
import Area from "./pages/ressources/area.jsx";
import Room from "./pages/ressources/room.jsx";
import Equipment from "./pages/ressources/equipment.jsx";
  import Treatments from "./pages/medicalTreatement";
import ShowPatientTreatments from "./pages/medicalTreatement/showPatientTreatements";
import ShowPatientToAdd from "./pages/medicalTreatement/showPatientToAdd";
import LeaveRequestForm from "./pages/Leaves/LeaveRequestForm";
 
import Listofleaves from "./pages/Leaves/Listleaves";
import MyLeaveRequests from "./pages/Leaves/MyLeaveRequests";
import Statleaves from "./pages/Leaves/Statleaves";
 
   
function App() {
  return (
    <>
      <Head />
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<Login />} />
          {/* Routes protégées (wrappées dans Layout) */}
          <Route
            path='/dashboard'
            element={
              <Layout>
                <EmployeeStats />
              </Layout>
            }
          />
          <Route
            path='/areas'
            element={
              <Layout>
                <Area />
              </Layout>
            }
          />
          <Route
            path='/rooms'
            element={
              <Layout>
                <Room />
              </Layout>
            }
          />
          <Route
            path='/equipments'
            element={
              <Layout>
                <Equipment />
              </Layout>
            }
          />
          <Route
            path='/users'
            element={
              <Layout>
                <ListeEmployees />
              </Layout>
            }
          />
          <Route
            path='/register'
            element={
              <Layout>
                <Register />
              </Layout>
            }
          />
 
          <Route path="/reset/:token" element={<ResetPassword />} />
          <Route path="/forget-password" element={<Passwordforget />} />
        
        
          <Route path="/medical-treatments" element={
            <Layout>
              <Treatments />
            </Layout>

          } />

<Route path="/medical-treatments/patient/show/:id" element={
            <Layout>
              <ShowPatientTreatments />
            </Layout>

          } />

          <Route path="/medical-treatments/patient/add/:id" element={
            <Layout>
              <ShowPatientToAdd />
            </Layout>

          } />

          <Route path="/leaverequest" element={<Layout><LeaveRequestForm /></Layout>} />
          <Route path="/leaves" element={<Layout><Listofleaves/></Layout>}      />
          <Route path="/MyLeaveRequests" element={<Layout><MyLeaveRequests/></Layout>}/>
          <Route path="statleaves" element={<Layout><Statleaves/></Layout>} />
 

           <Route
            path='/profile'
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />
          {/* Ajouter la route pour la reconnaissance faciale */}
          <Route path='/face-recognition' element={<FaceRecognition />} />
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
            path='/user'
            element={
              <Layout>
                <ListeEmployees />
              </Layout>
            }
          />
          <Route
            path='/user/profile/:id'
            element={
              <Layout>
                <EmployeesDetails />
              </Layout>
            }
          />
          <Route path='*' element={<NotFound />} /> {/* Page 404 */}
        </Routes>
        ;
      </Router>
    </>
  )
}

export default App;
