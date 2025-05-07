import React from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import Head from "../components/head";
import background from "../../public/back.jpg"; // Adjust the path accordingly

const Layout = ({ children }) => {
    return (
        <>
            <Head />
            <div 
  className="layout-wrapper layout-content-navbar" 
  style={{ 
   
    backgroundSize: '100% 100%', // Étire l'image pour remplir complètement l'élément
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh' // Ensures it covers the full screen
  }}
>                <div className="layout-container">
                    {/* Sidebar */}
                    <Sidebar />

                    <div className="layout-page">
                        <Navbar />
                        <div className="content-wrapper">
                            <div className="container-xxl flex-grow-1 container-p-y">
                                <div className="container-xxl flex-grow-1 container-p-y">
                                
                                            {children}


                                     
                                </div>
                            </div>
                        </div>
                        
                        { /*<footer className="content-footer footer bg-footer-theme"><Footer /></footer> */}
                    </div>

                    {/* Contenu de la page */}


                    {/* Footer pleine largeur */}
                </div>

            </div>
        </>
    );
};

export default Layout;
