import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Styles/Dashboard.css';

function MovilesCard({ abrirModalSalida, abrirModalRetorno }) {
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    const cargarUltimosMovimientos = async () => {
      try {
        const response = await axios.get('http://localhost:3001/moviles_movimientos');
        const datos = response.data.slice(-4).reverse(); // últimos 4 movimientos
        setMovimientos(datos);
      } catch (error) {
        console.error('Error al cargar movimientos recientes:', error);
      }
    };

    cargarUltimosMovimientos();
  }, []);

  return (
    <div className="moviles-card">
      <h3 className="moviles-card-titulo">Últimos movimientos</h3>
      <table className="moviles-card-tabla">
        <thead>
          <tr>
            <th>Móvil</th>
            <th>Chofer</th>
            <th>Fecha y Hora</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map(m => (
            <tr key={m.id}>
              <td>{m.interno}</td>
              <td>{m.chofer}</td>
              <td>{new Date(m.fecha_salida).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
              <td>{m.fecha_retorno ? 'Retorno' : 'Salida'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: '10px' }}>
        <a href="/moviles/movimientos" className="btn btn-moviles-card">Ir a gestión de móviles</a>
      </div>
    </div>
  );
}

export default MovilesCard;