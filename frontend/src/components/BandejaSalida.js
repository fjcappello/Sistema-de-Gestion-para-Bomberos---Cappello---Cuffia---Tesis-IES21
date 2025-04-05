import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Styles/BandejaEntrada.css';

function BandejaSalida({ onClose }) {
  const [mensajes, setMensajes] = useState([]);
  const [filtros, setFiltros] = useState({ destinatario: '', asunto: '', fecha: '' });
  const legajo = localStorage.getItem('legajo');

  useEffect(() => {
    if (legajo) {
      axios.get(`http://localhost:3001/mensajes/enviados/${legajo}`)
        .then((res) => setMensajes(res.data))
        .catch((err) => console.error('Error al obtener mensajes enviados', err));
    }
  }, [legajo]);

  const mensajesFiltrados = mensajes.filter((msg) =>
    msg.destinatario.toLowerCase().includes(filtros.destinatario.toLowerCase()) &&
    msg.asunto.toLowerCase().includes(filtros.asunto.toLowerCase()) &&
    msg.fecha_envio.includes(filtros.fecha)
  );

  return (
    <div className="bandeja-container">
      <h2>Bandeja de Salida</h2>

      <div className="bandeja-filtros">
        <input
          type="text"
          placeholder="Filtrar por destinatario"
          value={filtros.destinatario}
          onChange={(e) => setFiltros({ ...filtros, destinatario: e.target.value })}
        />
        <input
          type="text"
          placeholder="Filtrar por asunto"
          value={filtros.asunto}
          onChange={(e) => setFiltros({ ...filtros, asunto: e.target.value })}
        />
        <input
          type="date"
          value={filtros.fecha}
          onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
        />
        <button className="close-modal-btn" onClick={onClose}>Volver a entrada</button>
      </div>

      {mensajesFiltrados.length === 0 ? (
        <p>No hay mensajes enviados</p>
      ) : (
        <table className="bandeja-tabla">
          <thead>
            <tr>
              <th>Destinatario</th>
              <th>Fecha</th>
              <th>Asunto</th>
              <th>Mensaje</th>
            </tr>
          </thead>
          <tbody>
            {mensajesFiltrados.map((msg) => (
              <tr key={msg.id}>
                <td>{msg.destinatario}</td>
                <td>{new Date(msg.fecha_envio).toLocaleString()}</td>
                <td>{msg.asunto}</td>
                <td>{msg.cuerpo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default BandejaSalida;