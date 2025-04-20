import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Styles/Navbar.css';

function Navbar({ onLogout }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isReportsDropdownOpen, setReportsDropdownOpen] = useState(false);
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
        <li><Link to="/bandeja-entrada">Mensajes</Link></li>
        <li><Link to="/emergencias">Emergencias</Link></li>

        {/* Menú */}
        <li
          className="dropdown"
          onMouseEnter={() => setReportsDropdownOpen(true)}
          onMouseLeave={() => setReportsDropdownOpen(false)}
        >
          <Link to="#" className="dropdown-btn">
            Reportes
          </Link>
          {isReportsDropdownOpen && (
            <ul className="dropdown-menu">
              <li><Link to="/reportes/movimientos-personas">Reportes ingresos/salidas</Link></li>
              <li><Link to="#">Reportes movimientos moviles</Link></li>
            </ul>
          )}
        </li>

        <li
          className="dropdown"
          onMouseEnter={() => setReportsDropdownOpen(true)}
          onMouseLeave={() => setReportsDropdownOpen(false)}
        >
          <Link to="#" className="dropdown-btn">
            Estadísticas
          </Link>
          {isReportsDropdownOpen && (
            <ul className="dropdown-menu">
            <li><Link to="/reportes/estadisticas">Estadísticas emergencias</Link></li>
            {/* <li><Link to="/reportes/estadisticas-movimientos">Estadísticas movimientos</Link></li> */}
            {/* <li><Link to="/reportes/estadisticas-personas">Estadísticas personas</Link></li> */}
            </ul>
          )}
        </li>

        <li
          className="dropdown"
          onMouseEnter={() => setReportsDropdownOpen(true)}
          onMouseLeave={() => setReportsDropdownOpen(false)}
        >
          <Link to="#" className="dropdown-btn">
            Operaciones
          </Link>
          {isReportsDropdownOpen && (
            <ul className="dropdown-menu">
            <li><Link to="/personal">Personal</Link></li>
            <li><Link to="/moviles">Móviles</Link></li>
            <li><Link to="#">Pañol Operativo</Link></li>
            </ul>
          )}
        </li>

        
        <li><Link to="/configuracion">Configuración</Link></li>
        <li><button className="logout-btn" onClick={handleLogout}>Salir</button></li>
      </ul>

      <button className="hamburger" onClick={toggleMobileMenu}>
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
    </nav>
  );
}

export default Navbar;