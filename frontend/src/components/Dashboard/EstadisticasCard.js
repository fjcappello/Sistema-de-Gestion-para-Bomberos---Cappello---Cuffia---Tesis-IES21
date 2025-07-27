import React, { useEffect, useState } from 'react';
import api from '../../api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function EstadisticasCard() {
  const [data, setData] = useState([]);
  const [periodo, setPeriodo] = useState('30'); // Se situa por defecto en los ultimos 30 días, seleccionable desde el menu desplegable

  const fetchEstadisticas = async () => {
    try {
      const response = await api.get('/estadisticas', {
        params: { dias: periodo },
      });
      setData(response.data);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    }
  };

  useEffect(() => {
    fetchEstadisticas();
  }, [periodo]);

  const chartData = {
    labels: data.map((item) => item.tipo_asistencia),
    datasets: [
      {
        label: 'Cantidad de intervenciones',
        data: data.map((item) => item.cantidad),
        backgroundColor: '#e60000',
      },
    ],
  };

  return (
    <div>
      <h3>Estadísticas de Emergencias</h3>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="periodo">Periodo: </label>
        <select
          id="periodo"
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
        >
          <option value="30">Último mes</option>
          <option value="180">Últimos 6 meses</option>
          <option value="365">Último año</option>
        </select>
      </div>
      <div style={{ width: '100%', maxHeight: '300px' }}>
        <Bar data={chartData} />
      </div>
    </div>
  );
}

export default EstadisticasCard;