import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
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
        <li><Link to="#">Reportes</Link></li>
        <li><Link to="/personal">Personal</Link></li>
        <li><Link to="#">Configuración</Link></li>
        <li><Link to="#" className="logout-btn">Salir</Link></li>
      </ul>

      {/* Botón de menú hamburguesa visible en pantallas pequeñas */}
      <button className="hamburger" onClick={toggleMobileMenu}>
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
    </nav>
  );
}

export default Navbar;