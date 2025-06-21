import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUsuario } from '../context/UserContext';
import './Styles/Navbar.css';

function Navbar({ onLogout }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(''); // Para manejar un solo dropdown abierto a la vez en móvil

  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useUsuario();
  const navbarRef = useRef(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
    setOpenDropdown(''); // Cerrar dropdowns al cerrar el menú principal
  };

  const handleLogout = async () => {
    await onLogout();
    setMobileMenuOpen(false); // Cerrar menú móvil si está abierto
    navigate('/');
  };

  const handleDropdownToggle = (dropdownName) => {
    if (openDropdown === dropdownName) {
      setOpenDropdown('');
    } else {
      setOpenDropdown(dropdownName);
    }
  };

  // Cerrar menú móvil y dropdowns si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
        setOpenDropdown('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown('');
  }, [location]);


  const navItems = [
    { path: "/", label: "Principal" },
    { path: "/bandeja-entrada", label: "Mensajes" },
    { path: "/emergencias", label: "Emergencias" },
    {
      label: "Reportes", name: "reports", subItems: [
        { path: "/reportes/movimientos-personas", label: "Asistencia del personal" },
        { path: "/reportes/movimientos-moviles", label: "Movimientos de móviles" },
      ]
    },
    {
      label: "Estadísticas", name: "statistics", subItems: [
        { path: "/reportes/estadisticas", label: "Estadísticas emergencias" },
        { path: "/estadisticas-asistencia", label: "Estadísticas asistencia" },
      ]
    },
    {
      label: "Operaciones", name: "operations", subItems: [
        { path: "/personal", label: "Personal" },
        { path: "/moviles", label: "Móviles" },
        { path: "/panol-operativo", label: "Pañol Operativo" },
      ]
    },
    {
      label: "Configuración", name: "settings", subItems: [
        { path: "/mi-cuenta", label: "Mi cuenta" },
        ...( ["Administrador", "Jefatura"].includes(usuario?.rol) ? [
            { path: "/otras-cuentas", label: "Otras cuentas" },
            { path: "/auditoria", label: "Auditoría" },
        ] : [])
      ]
    }
  ];


  return (
    <nav className="navbar" ref={navbarRef}>
      <Link to="/" className="navbar-logo">
        <img src="/images/logo.png" alt="Logo" className="logo-img" /> {/* Cambiado className de img */}
        <span className="navbar-title">BOMBEROS SANTA MARIA DE PUNILLA</span>
      </Link>

      <button
        className={`hamburger-menu ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Abrir menú"
        aria-expanded={isMobileMenuOpen}
      >
        <span className="line line1"></span>
        <span className="line line2"></span>
        <span className="line line3"></span>
      </button>

      <ul className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
        {navItems.map(item => (
          <li key={item.label} className={item.subItems ? 'dropdown' : ''}>
            {item.subItems ? (
              <>
                <button
                  className={`dropdown-btn ${openDropdown === item.name ? 'active' : ''}`}
                  onClick={() => handleDropdownToggle(item.name)}
                  aria-haspopup="true"
                  aria-expanded={openDropdown === item.name}
                >
                  {item.label}
                </button>
                <ul className={`dropdown-menu ${openDropdown === item.name ? 'active' : ''}`}>
                  {item.subItems.map(subItem => (
                    <li key={subItem.path}>
                      <Link to={subItem.path}>{subItem.label}</Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Link to={item.path}>{item.label}</Link>
            )}
          </li>
        ))}
        <li>
          <button className="logout-btn" onClick={handleLogout}>
            Salir
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;