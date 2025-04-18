import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import PersonalTable from './components/PersonalTable';
import EmergenciesTable from './components/EmergenciesTable';
import Login from './components/Login';
import './components/Styles/App.css';
import ReportsPage from './components/ReportsPage';
import EnviarMensaje from './components/EnviarMensaje';
import BandejaEntrada from './components/BandejaEntrada';
import EnviarMensajeModal from './components/EnviarMensajeModal';
import ModalCambioPassword from './components/ModalCambioPassword';
import Configuracion from './components/Configuracion';
import { useUsuario } from './context/UserContext';
import MovimientosPersonas from './components/MovimientosPersonas';
import MovilesRegistro from './components/MovilesRegistro';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { usuario, setUsuario } = useUsuario();
  const [horaActual, setHoraActual] = useState(new Date());

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUsuario = localStorage.getItem('usuario');

    if (storedAuth === 'true' && storedUsuario) {
      setIsAuthenticated(true);
      const usuarioParseado = JSON.parse(storedUsuario);
      setUsuario(usuarioParseado);
    } else {
      setIsAuthenticated(false);
      setUsuario(null);
    }
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(new Date());
    }, 60000); // cada 1 minuto

    return () => clearInterval(intervalo);
  }, []);

  const handleLogout = async () => {
    const usuarioActual = JSON.parse(localStorage.getItem('usuario'));

    if (usuarioActual) {
      try {
        await axios.post('http://localhost:3001/bitacora/logout', {
          usuario_id: usuarioActual.legajo,
          accion: 'Cierre de sesión'
        });
        console.log('Logout registrado en bitácora');
      } catch (error) {
        console.error('Error registrando logout en bitácora:', error);
      }
    }

    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="App">
        {usuario?.primerIngreso && (
          <ModalCambioPassword
            legajo={usuario.legajo}
            onPasswordChanged={() => {
              const usuarioActualizado = { ...usuario, primerIngreso: false };
              setUsuario(usuarioActualizado);
              localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
            }}
          />
        )}
        {isAuthenticated && <Navbar onLogout={handleLogout} />}

        <main>
          <Routes>
            {!isAuthenticated ? (
              <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            ) : (
              <>
                <Route
                  path="/"
                  element={
                    usuario ? (
                      <>
                        <div style={{
                          textAlign: 'right',
                          fontSize: '0.9rem',
                          color: '#333',
                          marginTop: '1rem',
                          marginRight: '2rem'
                        }}>
                          Bienvenido {usuario.nombreCompleto}. {horaActual.toLocaleDateString('es-AR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })} - {horaActual.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                        <h1 style={{ textAlign: 'center', marginTop: '2rem' }}>Bienvenido al Sistema de Gestión de Bomberos</h1>
                      </>
                    ) : null
                  }
                />
                <Route path="/emergencias" element={<EmergenciesTable />} />
                <Route path="/personal" element={<PersonalTable />} />
                <Route path="/reportes/estadisticas" element={<ReportsPage />} />
                <Route path="/reportes/movimientos-personas" element={<MovimientosPersonas />} />
                <Route path="/bandeja-entrada" element={<BandejaEntrada />} />
                <Route path="/configuracion" element={<Configuracion />} />
                <Route path="/moviles" element={<MovilesRegistro />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;