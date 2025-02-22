import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

 

import "./App.css"; // Style global
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Authentification/Login";
import Register from "./pages/Authentification/Resgister";
import NotFound from "./pages/Exceptions/NotFound";
import Layout from "./layout/Layout";
import Head from "./components/head";

function App() {
  return (
    <>
    <Head /> 
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} /> {/* Page 404 */}
        </Routes>
      </Layout>
    </Router>
    </>
  );
}

export default App;
