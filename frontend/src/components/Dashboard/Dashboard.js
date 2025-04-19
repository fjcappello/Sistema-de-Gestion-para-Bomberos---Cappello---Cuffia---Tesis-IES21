

import React, { useEffect, useState } from 'react';
import { useUsuario } from '../../context/UserContext';
import '../Styles/Dashboard.css';


import IngresosEgresosCard from './IngresosEgresosCard';
import ClimaCard from './ClimaCard';
import MovilesCard from './MovilesCard';
import EstadisticasCard from './EstadisticasCard';

function Dashboard() {
  const { usuario } = useUsuario();
  const [horaActual, setHoraActual] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(new Date());
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);
  
  const obtenerSaludo = () => {
    const hora = horaActual.getHours();
    if (hora >= 6 && hora < 12) return 'Buenos días';
    if (hora >= 12 && hora < 20) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="dashboard-container">
      <div className="bienvenida-usuario">
        {obtenerSaludo()}, <strong>{usuario?.nombreCompleto}</strong>. {horaActual.toLocaleDateString('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })} - {horaActual.toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <IngresosEgresosCard />
        </div>
        <div className="dashboard-card">
          <ClimaCard />
        </div>
        <div className="dashboard-card">
          <MovilesCard />
        </div>
        <div className="dashboard-card">
          <EstadisticasCard />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;