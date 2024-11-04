import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import PersonalTable from './components/PersonalTable';
import EmergenciesTable from './components/EmergenciesTable';
import Login from './components/Login';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
    };

  return (
    <Router>
      <div className="App">
        {}
        {isAuthenticated && <Navbar onLogout={handleLogout} />}

        <main>
          <Routes>
            {}
            {!isAuthenticated ? (
              <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            ) : (
              <>
                {}
                <Route path="/" element={<h1>Bienvenido al Sistema de Gestión de Bomberos</h1>} />

                {}
                <Route path="/emergencias" element={<EmergenciesTable />} />

                {}
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