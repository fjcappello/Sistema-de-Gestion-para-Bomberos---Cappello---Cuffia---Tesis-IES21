import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useUsuario } from '../context/UserContext';
import './Styles/Navbar.css'; // Estilos Win98

function Navbar({ onLogout }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { usuario } = useUsuario();
  const navbarRef = useRef(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
    setOpenDropdown('');
  };

  const handleLogout = async () => {
    await onLogout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleDropdownToggle = (dropdownName) => {
    if (openDropdown === dropdownName) {
      setOpenDropdown('');
    } else {
      setOpenDropdown(dropdownName);
    }
  };

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

  useEffect(() => {
    // Cerrar menú móvil y dropdowns al cambiar de ruta
    setMobileMenuOpen(false);
    setOpenDropdown('');
  }, [location]);


  const navItems = [
    { path: "/", label: "Principal", exact: true },
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
        <img src="/images/logo.png" alt="Logo" className="logo-img" />
        {/* El título se oculta en CSS por ahora, pero podría mostrarse aquí si se desea */}
        {/* <span className="navbar-title">BOMBEROS</span> */}
      </Link>

      {/* Botón Hamburguesa - la clase 'open' o 'active' se usa para el estado presionado si se define en CSS */}
      <button
        className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Abrir menú"
        aria-expanded={isMobileMenuOpen}
      >
        <span className="line"></span>
        <span className="line"></span>
        <span className="line"></span>
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
                      <NavLink to={subItem.path} end={subItem.exact || false}>
                        {subItem.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <NavLink to={item.path} end={item.exact || false}>
                {item.label}
              </NavLink>
            )}
          </li>
        ))}
        {/* Botón Salir como un item de menú más */}
        <li>
          <button className="logout-btn-link-style" onClick={handleLogout}>
            Salir
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;