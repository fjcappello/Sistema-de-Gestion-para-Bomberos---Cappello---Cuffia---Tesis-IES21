import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUsuario } from '../context/UserContext';
import './Styles/Navbar.css';

function Navbar({ onLogout }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isReportsDropdownOpen, setReportsDropdownOpen] = useState(false);
  const [isStatisticsDropdownOpen, setStatisticsDropdownOpen] = useState(false);
  const [isOperationsDropdownOpen, setOperationsDropdownOpen] = useState(false);
  const [isSettingsDropdownOpen, setSettingsDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const { usuario } = useUsuario();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/images/logo.png" alt="Logo" className="logo" />
        <span className="navbar-title">BOMBEROS SANTA MARIA DE PUNILLA</span>
      </div>

      <ul className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
        <li>
          <Link to="/">Principal</Link>
        </li>
        <li>
          <Link to="/bandeja-entrada">Mensajes</Link>
        </li>
        <li>
          <Link to="/emergencias">Emergencias</Link>
        </li>

        {/* Reportes */}
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
              <li>
                <Link to="/reportes/movimientos-personas">Asistencia del personal</Link>
              </li>
              <li>
                <Link to="/reportes/movimientos-moviles">Movimientos de móviles</Link>
              </li>
            </ul>
          )}
        </li>

        {/* Estadísticas */}
        <li
          className="dropdown"
          onMouseEnter={() => setStatisticsDropdownOpen(true)}
          onMouseLeave={() => setStatisticsDropdownOpen(false)}
        >
          <Link to="#" className="dropdown-btn">
            Estadísticas
          </Link>
          {isStatisticsDropdownOpen && (
            <ul className="dropdown-menu">
              <li>
                <Link to="/reportes/estadisticas">Estadísticas emergencias</Link>
              </li>
              <li>
                <Link to="/estadisticas-asistencia">Estadísticas asistencia</Link>
              </li>
            </ul>
          )}
        </li>

        {/* Operaciones */}
        <li
          className="dropdown"
          onMouseEnter={() => setOperationsDropdownOpen(true)}
          onMouseLeave={() => setOperationsDropdownOpen(false)}
        >
          <Link to="#" className="dropdown-btn">
            Operaciones
          </Link>
          {isOperationsDropdownOpen && (
            <ul className="dropdown-menu">
              <li>
                <Link to="/personal">Personal</Link>
              </li>
              <li>
                <Link to="/moviles">Móviles</Link>
              </li>
              <li>
                <Link to="/panol-operativo">Pañol Operativo</Link>
              </li>
            </ul>
          )}
        </li>

        {/* Configuración */}
        <li
          className="dropdown"
          onMouseEnter={() => setSettingsDropdownOpen(true)}
          onMouseLeave={() => setSettingsDropdownOpen(false)}
        >
          <Link to="#" className="dropdown-btn">
            Configuración
          </Link>
          {isSettingsDropdownOpen && (
            <ul className="dropdown-menu">
              <li>
                <Link to="/mi-cuenta">Mi cuenta</Link>
              </li>
              {["Administrador", "Jefatura"].includes(usuario?.rol) && (
                <>
                  <li>
                    <Link to="/otras-cuentas">Otras cuentas</Link>
                  </li>
                  <li>
                    <Link to="/auditoria">Auditoría</Link>
                  </li>
                </>
              )}
            </ul>
          )}
        </li>

        {/* Salir */}
        <li>
          <button className="logout-btn" onClick={handleLogout}>
            Salir
          </button>
        </li>
      </ul>

      {/* Botón menú hamburguesa */}
      <button className="hamburger" onClick={toggleMobileMenu}>
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
      </button>
    </nav>
  );
}

export default Navbar;