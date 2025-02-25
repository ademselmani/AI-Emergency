/** @format */

import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import "./App.css" // Style global
import Login from "./pages/Authentification/Login"
import Register from "./pages/Authentification/Resgister"
import NotFound from "./pages/Exceptions/NotFound"
import Layout from "./layout/Layout"
import Head from "./components/head"
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
      </Router>
    </>
  )
}

export default App
