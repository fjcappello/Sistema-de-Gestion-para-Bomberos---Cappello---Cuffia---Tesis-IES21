import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar({ onLogout }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate(); 

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    onLogout(); 
    navigate('/'); 
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/images/logo.png" alt="Logo" className="logo" />
        <span className="navbar-title">BOMBEROS SANTA MARIA DE PUNILLA</span>
      </div>

      <ul className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
        <li><Link to="/">Principal</Link></li>
        <li><Link to="#">Novedades</Link></li>
        <li><Link to="/emergencias">Emergencias</Link></li>
        <li><Link to="/reportes">Reportes</Link></li>
        <li><Link to="/personal">Personal</Link></li>
        <li><Link to="#">Configuración</Link></li>
        <li><button className="logout-btn" onClick={handleLogout}>Salir</button></li>
      </ul>

      {/* Menu hamburguesa  */}
      <button className="hamburger" onClick={toggleMobileMenu}>
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
    </nav>
  );
}

export default Navbar;