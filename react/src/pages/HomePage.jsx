import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import AmbulancePatient from './Ambulance/AmbulancePatient';
import logo from "../../public/assets/img/logoPI.png";
import { FiArrowUpRight, FiSend } from 'react-icons/fi';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const features = [
  {
    title: "Advanced geolocation",
    description: "Automatic position detection and optimized route",
    icon: "📍"
  },
  {
    title: "AI triage",
    description: "Automatic severity assessment to prioritize interventions",
    icon: "🤖"
  },
  {
    title: "Instant medical records",
    description: "Secure access to background during transport",
    icon: "📁"
  },
  {
    title: "Unified communications",
    description: "Direct connection with the emergency to prepare for arrival",
    icon: "📡"
  }
];

const slides = [
  {
    gif: "/Hospital2.gif",
    title: "Emergency Response",
    subtitle: "Immediate medical assistance at your fingertips"
  },
  {
    gif: "/Hospital.gif", 
    title: "Fast Deployment",
    subtitle: "24/7 emergency coverage across the city"
  }
];

function HomePage() {
  const sectionsRef = useRef({
    about: useRef(null),
    ambulance: useRef(null),
    home: useRef(null)
  });

  const [activeSlide, setActiveSlide] = useState(0);

  const scrollToSection = (ref) => {
    window.scrollTo({
      top: ref.current.offsetTop - 80,
      behavior: 'smooth'
    });
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="app-container">
      <nav className="glass-navbar">
        <div className="nav-content">
          <div className="brand-wrapper" onClick={() => scrollToSection(sectionsRef.current.home)}>
            <img src={logo} alt="RescueOn" className="logo" />
            <span className="app-name">RescueOn</span>
          </div>
          
          <div className="nav-links">
            {['Home', 'About', 'Ambulance'].map((item) => (
              <button
                key={item}
                className="nav-link"
                onClick={() => scrollToSection(sectionsRef.current[item.toLowerCase()])}
              >
                <FiArrowUpRight className="link-icon" />
                {item}
              </button>
            ))}
            <a href="/login" className="login-button">
              Login <FiArrowUpRight />
            </a>
          </div>
        </div>
      </nav>
      <div className="main-content">
      <header className="hero-section" ref={sectionsRef.current.home}>
        <div className="slider-container">
          {slides.map((slide, index) => (
            <motion.div 
              key={index}
              className={`slide ${index === activeSlide ? 'active' : ''}`}
              initial={{ opacity: 0}}
              animate={{ opacity: index === activeSlide ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              <img 
                src={slide.gif} 
                alt={`Slide ${index + 1}`} 
                className="slider-gif" 
              />
              <div className="slider-overlay" />
              <div className="slider-content">
                <p className="hero-subtitle">{slide.subtitle}</p>
              </div>
            </motion.div>
          ))}
          
          <button className="slider-arrow prev" onClick={prevSlide}>
            <FaChevronLeft />
          </button>
          <button className="slider-arrow next" onClick={nextSlide}>
            <FaChevronRight />
          </button>
        </div>
      </header>

      <section className="section about-section" ref={sectionsRef.current.about}>
        <div className="section-content">
          <h2 className="section-title">Our Mission</h2>
          <div className="mission-grid">
            <motion.div 
              className="mission-card"
              whileHover={{ scale: 1.05 }}
            >
              <div className="card-icon">🚑</div>
              <h3>Rapid Response</h3>
              <p>Average response time under 15 minutes in urban areas</p>
            </motion.div>
            
            <motion.div 
              className="mission-card"
              whileHover={{ scale: 1.05 }}
            >
              <div className="card-icon">👨⚕️</div>
              <h3>Expert Teams</h3>
              <p>Certified medical professionals on every deployment</p>
            </motion.div>
            
            <motion.div 
              className="mission-card"
              whileHover={{ scale: 1.05 }}
            >
              <div className="card-icon">📱</div>
              <h3>Smart Tracking</h3>
              <p>Real-time ambulance tracking and ETA updates</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section features-section">
        <div className="section-content">
          <h2 className="section-title">Smart Emergency Features</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="feature-card"
                whileHover={{ y: -10 }}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section contact-section" ref={sectionsRef.current.ambulance}>
        <AmbulancePatient />
      </section>
      </div>
      <footer className="modern-footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <img src={logo} alt="RescueOn" className="footer-logo" />
              <span className="footer-app-name">RescueOn</span>
            </div>
            <p className="footer-description">
              Advanced emergency response system with intelligent dispatch and real-time tracking.
            </p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <nav className="footer-links">
              <a href="#home" onClick={() => scrollToSection(sectionsRef.current.home)}>Home</a>
              <a href="#about" onClick={() => scrollToSection(sectionsRef.current.about)}>About</a>
              <a href="#ambulance" onClick={() => scrollToSection(sectionsRef.current.ambulance)}>Ambulance</a>
              <a href="/login">Login</a>
            </nav>
          </div>
          
          <div className="footer-section">
            <h4>Contact Us</h4>
            <div className="contact-info">
              <p>Email: contact@rescueon.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <div className="emergency-contact">
                <span className="emergency-number">112</span>
                <p>24/7 Emergency Hotline</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} RescueOn. All rights reserved</p>
          <div className="legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        :root {
          --primary: #ff3b3f;
          --secondary: #2d2d2d;
          --accent: #007bff;
          --text: #333;
          --light: #f8f9fa;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: 'Poppins', sans-serif;
          color: var(--text);
          line-height: 1.6;
        }

        .app-container {
          overflow-x: hidden;
          position: relative;
          min-height: 100vh;
         
          
        }

        /* Navbar styles */
        .glass-navbar {
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          padding: 1rem 2rem;
        }

        .nav-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
        }

        .logo {
          height: 50px;
          width: auto;
        }

        .app-name {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          color: var(--text);
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .nav-link:hover {
          color: var(--primary);
        }

        .login-button {
          background: var(--primary);
          color: white;
          padding: 0.8rem 1.5rem;
          border-radius: 50px;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.3s ease;
        }

        .login-button:hover {
          transform: translateY(-2px);
        }

        /* Hero section */
        .hero-section {
          margin-top: 80px; /* Offset for fixed navbar */
        }

        .slider-container {
          position: relative;
          width: 100%;
          height: 90vh;
          overflow: hidden;
        }

        .slide {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
        }

        .slide.active {
          opacity: 1;
        }

        .slider-gif {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          top: 0;
          left: 0;
        }

        .slider-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.4);
        }

        .slider-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: white;
          z-index: 2;
          width: 90%;
          max-width: 1200px;
        }

        .hero-subtitle {
          font-size: 1.8rem;
          max-width: 600px;
          margin: 0 auto;
          text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        }

        /* Section styles */
        .section {
          padding: 5rem 2rem;
        }

        .section-content {
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 3rem;
          color: var(--secondary);
        }

        /* Mission grid */
        .mission-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 2rem;
        }

        .mission-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          text-align: center;
          transition: transform 0.3s ease;
        }

        .card-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        /* Features grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          margin-top: 2rem;
        }

        .feature-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        /* Footer styles */
        .modern-footer {
          background: var(--secondary);
          color: white;
          padding: 4rem 0 0;
          
          margin-top: auto;
          bottom: 0;
          width: 100%;
          height: auto;

        }
        .main-content {
          flex: 1;
          padding-bottom: 2rem; /* Ajustez selon besoin */
        }   

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3rem;
          padding: 0 2rem 2rem;
        }

        .footer-section {
          margin-bottom: 2rem;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .footer-logo {
          height: 40px;
          width: auto;
        }

        .footer-app-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--primary);
        }

        .footer-description {
          opacity: 0.8;
          font-size: 0.9rem;
        }

        .footer-section h4 {
          margin-bottom: 1.5rem;
          color: var(--primary);
          font-size: 1.2rem;
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-links a {
          color: white;
          text-decoration: none;
          transition: color 0.3s ease;
          opacity: 0.8;
        }

        .footer-links a:hover {
          color: var(--primary);
          opacity: 1;
        }

        .contact-info p {
          margin-bottom: 1rem;
          opacity: 0.8;
        }

        .emergency-number {
          font-size: 2rem;
          font-weight: bold;
          color: var(--primary);
          display: block;
          margin-bottom: 0.5rem;
        }

        .footer-bottom {
          background: rgba(0, 0, 0, 0.2);
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-bottom p {
          opacity: 0.7;
          font-size: 0.9rem;
        }

        .legal-links {
          display: flex;
          gap: 1.5rem;
        }

        .legal-links a {
          color: white;
          text-decoration: none;
          opacity: 0.7;
          font-size: 0.9rem;
          transition: opacity 0.3s ease;
        }

        .legal-links a:hover {
          opacity: 1;
        }

        /* Slider arrows */
        .slider-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          padding: 1rem;
          border-radius: 50%;
          cursor: pointer;
          z-index: 3;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .slider-arrow:hover {
          background: var(--primary);
          transform: translateY(-50%) scale(1.1);
        }

        .prev { left: 2rem; }
        .next { right: 2rem; }

        /* Responsive styles */
        @media (max-width: 1024px) {
          .mission-grid,
          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .footer-content {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }

          .mission-grid,
          .features-grid {
            grid-template-columns: 1fr;
          }

          .slider-arrow {
            padding: 0.8rem;
          }
          
          .prev { left: 1rem; }
          .next { right: 1rem; }

          .footer-content {
            grid-template-columns: 1fr;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .hero-subtitle {
            font-size: 1.2rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .section {
            padding: 3rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}

export default HomePage;