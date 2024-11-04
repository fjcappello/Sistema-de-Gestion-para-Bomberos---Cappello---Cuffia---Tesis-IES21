import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import PersonalTable from './components/PersonalTable';
import EmergenciesTable from './components/EmergenciesTable';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Barra de navegación */}
        <Navbar />

        <main>
          <Routes>
            {/* Página de inicio o bienvenida */}
            <Route path="/" element={<h1>Bienvenido al Sistema de Gestión de Bomberos</h1>} />

            {/* Ruta de Emergencias */}
            <Route path="/emergencias" element={<EmergenciesTable />} />

            {/* Ruta de Personal */}
            <Route path="/personal" element={<PersonalTable />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;