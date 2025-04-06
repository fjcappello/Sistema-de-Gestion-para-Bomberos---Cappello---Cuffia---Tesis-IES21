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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    const storedUsuario = localStorage.getItem('usuario');
    if (storedAuth === 'true' && storedUsuario) {
      setIsAuthenticated(true);
      setUsuario(JSON.parse(storedUsuario));
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsuario(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('usuario');
  };

  return (
    <Router>
      <div className="App">
        {}
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
            {}
            {!isAuthenticated ? (
              <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} setUsuario={setUsuario} />} />
            ) : (
              <>
                {}
                <Route path="/" element={<h1>Bienvenido al Sistema de Gestión de Bomberos</h1>} />

                {}
                <Route path="/emergencias" element={<EmergenciesTable />} />

                {}
                <Route path="/personal" element={<PersonalTable />} />
                {}
                <Route path="/reportes/estadisticas" element={<ReportsPage />} />
                {}
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