import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiSend, FiMessageCircle } from 'react-icons/fi';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import AmbulancePatient from './Ambulance/AmbulancePatient';
import logo from "../../public/assets/img/logoPI.png";
import ChatBot from './ChatBot';
import { Helmet } from 'react-helmet';

const features = [
  {
    title: 'Advanced geolocation',
    description: 'Automatic position detection and optimized route',
    icon: '📍',
  },
  {
    title: 'AI triage',
    description: 'Automatic severity assessment to prioritize interventions',
    icon: '🤖',
  },
  {
    title: 'Instant medical records',
    description: 'Secure access to background during transport',
    icon: '📁',
  },
  {
    title: 'Unified communications',
    description: 'Direct connection with the emergency to prepare for arrival',
    icon: '📡',
  },
];

const slides = [
  {
    gif: '/Hospital2.gif',
    title: 'Emergency Response',
    subtitle: 'Immediate medical assistance at your fingertips',
  },
  {
    gif: '/Hospital.gif',
    title: 'Fast Deployment',
    subtitle: '24/7 emergency coverage across the city',
  },
];

function HomePage() {
  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const ambulanceRef = useRef(null);

  const [activeSlide, setActiveSlide] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const scrollToSection = (ref) => {
    window.scrollTo({
      top: ref.current?.offsetTop - 80,
      behavior: 'smooth',
    });
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (

    <>
      <Helmet>
        <title>RescueOn - Smart Emergency Response</title>
      </Helmet>
    <div className="app-container">
      <nav className="glass-navbar">
        <div className="nav-content">
          <div className="brand-wrapper" onClick={() => scrollToSection(homeRef)}>
            <img src={logo} alt="RescueOn" className="logo" />
            <span className="app-name"></span>
          </div>

          <div className="nav-links">
            {[
              { name: 'Home', ref: homeRef },
              { name: 'About', ref: aboutRef },
              { name: 'Ambulance', ref: ambulanceRef },
            ].map((item) => (
              <button
                key={item.name}
                className="nav-link"
                onClick={() => scrollToSection(item.ref)}
                aria-label={`Navigate to ${item.name} section`}
              >
                <FiArrowUpRight className="link-icon" />
                {item.name}
              </button>
            ))}
            <a href="/login" style={{ color: '#000000' }}>
  Login <FiArrowUpRight />
</a>
          </div>
        </div>
      </nav>

      <motion.button
        className="chat-button"
        onClick={() => setShowChat(!showChat)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle chat"
      >
        <FiMessageCircle />
      </motion.button>

      <motion.div
        initial={false}
        animate={{ opacity: showChat ? 1 : 0, pointerEvents: showChat ? 'auto' : 'none' }}
        transition={{ duration: 0.3 }}
      >
        {showChat && <ChatBot onClose={() => setShowChat(false)} />}
      </motion.div>

      <div className="main-content">
        <header className="hero-section" ref={homeRef}>
          <div className="slider-container">
            {slides.map((slide, index) => (
              <motion.div
                key={index}
                className={`slide ${index === activeSlide ? 'active' : ''}`}
                initial={{ opacity: 0, x: 100 }}
                animate={{
                  opacity: index === activeSlide ? 1 : 0,
                  x: index === activeSlide ? 0 : 100,
                }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={slide.gif}
                  alt={`Slide ${index + 1}`}
                  className="slider-gif"
                  loading="lazy"
                />
                <div className="slider-overlay" />
                <div className="slider-content">
                  <p className="hero-subtitle">{slide.subtitle}</p>
                </div>
              </motion.div>
            ))}

            <button className="slider-arrow prev" onClick={prevSlide} aria-label="Previous slide">
              <FaChevronLeft />
            </button>
            <button className="slider-arrow next" onClick={nextSlide} aria-label="Next slide">
              <FaChevronRight />
            </button>
          </div>
        </header>

        <section className="section about-section" ref={aboutRef}>
          <div className="section-content">
            <h2 className="section-title">Our Mission</h2>
            <div className="mission-grid">
              {[
                { icon: '🚑', title: 'Rapid Response', text: 'Average response time under 15 minutes in urban areas' },
                { icon: '👨⚕', title: 'Expert Teams', text: 'Certified medical professionals on every deployment' },
                { icon: '📱', title: 'Smart Tracking', text: 'Real-time ambulance tracking and ETA updates' },
              ].map((card, index) => (
                <motion.div
                  key={index}
                  className="mission-card"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="card-icon">{card.icon}</div>
                 <h3 style={{ color: '#000000' }}>{card.title}</h3>
                  <p>{card.text}</p>
                </motion.div>
              ))}
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
                  <h3 style={{ color: '#000000' }}>{feature.title}</h3>
                  <p>{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section contact-section" ref={ambulanceRef}>
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
              <a href="#home" onClick={() => scrollToSection(homeRef)}>Home</a>
              <a href="#about" onClick={() => scrollToSection(aboutRef)}>About</a>
              <a href="#ambulance" onClick={() => scrollToSection(ambulanceRef)}>Ambulance</a>
              <a href="/login" style={{ color: '#000000' }}>Login</a>


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

      <style jsx>{`
        /* Scoped styles to avoid global conflicts */
        :root {
          --primary: #ff3b3f;
          --secondary: #2d2d2d;
          --accent: #007bff;
             --text: #000000;      // Texte principal en noir

          --light: #f8f9fa;
        }

        .app-container {
          overflow-x: hidden;
          position: relative;
          min-height: 100vh;
        }

        .glass-navbar {
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 30px RGBA(0, 0, 0, 0.1);
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
          color: black;
        }

      


        .hero-section {
          margin-top: 80px;
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
          color: #000000;
        }

        .mission-grid {
          display: grid;
          color:black;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 2rem;
        }

        .mission-card {
          background: white;
          color:black;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          text-align: center;
          transition: transform 0.3s ease;
        }

        .card-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          margin-top: 2rem;
          color: #000000;
        }

        .feature-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          color: #000000;
         
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .modern-footer {
          background: var(--secondary);
          color: white;
          padding: 4rem 0 0;
        }

        .main-content {
          flex: 1;
          padding-bottom: 2rem;
          color: #000000;
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
          background: black;
          transform: translateY(-50%) scale(1.1);
        }

        .prev {
          left: 2rem;
        }
        .next {
          right: 2rem;
        }

        .chat-button {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: var(--primary);
          color: black;
          border: none;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(255, 59, 63, 0.3);
          z-index: 1001;
        }

        .chat-container {
          position: fixed;
          bottom: 8rem;
          right: 2rem;
          width: 380px;
          max-height: 70vh;
          background: white;
          border-radius: 20px;
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          z-index: 1002;
          transform-origin: bottom right;
        }

        .chat-header {
          background: var(--primary);
          color: black;
          padding: 1.2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-title {
          font-weight: 600;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .chat-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .chat-close:hover {
          transform: rotate(90deg);
        }

        .chat-messages {
          flex: 1;
          padding: 1.5rem;
          overflow-y: auto;
          background: #f9f9f9;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          max-width: 80%;
          padding: 0.8rem 1.2rem;
          border-radius: 18px;
          font-size: 0.95rem;
          line-height: 1.4;
          animation: messageAppear 0.2s ease-out;
        }

        @keyframes messageAppear {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .bot-message {
          align-self: flex-start;
          background: white;
          color: var(--text);
          border-bottom-left-radius: 5px;
          box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
        }

        .user-message {
          align-self: flex-end;
          background: var(--primary);
          color: white;
          border-bottom-right-radius: 5px;
        }

        .chat-input-container {
          display: flex;
          padding: 1rem;
          background: white;
          border-top: 1px solid #eee;
        }

        .chat-input {
          flex: 1;
          padding: 0.8rem 1.2rem;
          border: 1px solid #ddd;
          border-radius: 50px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.3s ease;
          resize: none;
          height: 45px;
        }

        .chat-input:focus {
          border-color: var(--primary);
        }

        .send-button {
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 50%;
          width: 45px;
          height: 45px;
          margin-left: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.3s ease;
        }

        .send-button:hover {
          background: #ff1f23;
          transform: translateY(-2px);
        }

        .send-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .typing-indicator {
          display: flex;
          align-items: center;
          padding: 0.5rem 1.2rem;
          background: white;
          border-radius: 18px;
          align-self: flex-start;
          box-shadow: 0 3px 15px rgba(0, 0, 0, 0.05);
          margin-bottom: 0.5rem;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background: #ccc;
          border-radius: 50%;
          margin: 0 2px;
          animation: typingAnimation 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) {
          animation-delay: 0s;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typingAnimation {
          0%,
          60%,
          100% {
            transform: translateY(0);
            background: #ddd;
          }
          30% {
            transform: translateY(-5px);
            background: #999;
          }
        }

        @media (max-width: 768px) {
          .chat-container {
            width: 90vw;
            right: 5vw;
            bottom: 7rem;
            max-height: 60vh;
          }

          .mission-grid,
          .features-grid {
            grid-template-columns: 1fr;
          }

          .footer-content {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .chat-button {
            width: 50px;
            height: 50px;
            bottom: 1.5rem;
            right: 1.5rem;
          }

          .hero-subtitle {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
    </>
  );
}

export default HomePage;
