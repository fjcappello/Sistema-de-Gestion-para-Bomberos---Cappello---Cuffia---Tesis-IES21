import React, { useState, useEffect } from 'react';
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
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
          {isAuthenticated && usuario && (
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
          )}
          <Routes>
            {!isAuthenticated ? (
              <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            ) : (
              <>
                <Route path="/" element={<h1>Bienvenido al Sistema de Gestión de Bomberos</h1>} />
                <Route path="/emergencias" element={<EmergenciesTable />} />
                <Route path="/personal" element={<PersonalTable />} />
                <Route path="/reportes/estadisticas" element={<ReportsPage />} />
                <Route path="/bandeja-entrada" element={<BandejaEntrada />} />
                <Route path="/configuracion" element={<Configuracion />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;