import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import PersonalTable from './components/PersonalTable';
import EmergenciesTable from './components/EmergenciesTable';
import Login from './components/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar el estado de autenticación al cargar la aplicación
  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated'); // Limpiar el estado de autenticación
  };

  return (
    <Router>
      <div className="App">
        {/* Muestra el Navbar solo si está autenticado */}
        {isAuthenticated && <Navbar onLogout={handleLogout} />}

        <main>
          <Routes>
            {/* Página de login */}
            {!isAuthenticated ? (
              <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            ) : (
              <>
                {/* Página de inicio o bienvenida */}
                <Route path="/" element={<h1>Bienvenido al Sistema de Gestión de Bomberos</h1>} />

                {/* Ruta de Emergencias */}
                <Route path="/emergencias" element={<EmergenciesTable />} />

                {/* Ruta de Personal */}
                <Route path="/personal" element={<PersonalTable />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;