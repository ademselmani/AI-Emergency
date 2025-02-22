import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Head from "../components/head";

const Layout = ({ children }) => {
    return (
        <>
            <Head />
            <div class="layout-wrapper layout-content-navbar">
                <div class="layout-container">
                    {/* Sidebar */}
                    <Sidebar />

                    <div class="layout-page">
                        <Navbar />
                        <div class="content-wrapper">
                            <div class="container-xxl flex-grow-1 container-p-y">
                                <div class="container-xxl flex-grow-1 container-p-y">
                                
                                            {children}


                                     
                                </div>
                            </div>
                        </div> <footer className="content-footer footer bg-footer-theme"><Footer /></footer>
                    </div>

                    {/* Contenu de la page */}


                    {/* Footer pleine largeur */}
                </div>

            </div>
        </>
    );
};

export default Layout;
