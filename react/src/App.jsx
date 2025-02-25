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

export default App;
