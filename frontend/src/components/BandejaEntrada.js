import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EnviarMensajeModal from './EnviarMensajeModal';
import BandejaSalida from './BandejaSalida';
import './Styles/BandejaEntrada.css';

function BandejaEntrada() {
  const [mensajes, setMensajes] = useState([]);
  const [filtros, setFiltros] = useState({ remitente: '', asunto: '', fecha: '' });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [bandejaActiva, setBandejaActiva] = useState('entrada');
  const legajo = localStorage.getItem('legajo');

  const fetchMensajes = () => {
    if (legajo) {
      axios.get(`http://localhost:3001/mensajes/recibidos/${legajo}`)
        .then((res) => setMensajes(res.data))
        .catch((err) => console.error('Error al obtener mensajes', err));
    }
  };

  useEffect(() => {
    fetchMensajes();
  }, [legajo]);

  const marcarComoLeido = async (id) => {
    try {
      await axios.put(`http://localhost:3001/mensajes/marcar-leido/${id}`);
      setMensajes((prev) =>
        prev.map((m) => (m.id === id ? { ...m, leido: 1 } : m))
      );
    } catch (error) {
      console.error('Error al marcar como leído', error);
    }
  };

  const mensajesFiltrados = mensajes.filter((msg) =>
    msg.remitente.toLowerCase().includes(filtros.remitente.toLowerCase()) &&
    msg.asunto.toLowerCase().includes(filtros.asunto.toLowerCase()) &&
    msg.fecha_envio.includes(filtros.fecha)
  );

  const mensajesNoLeidos = mensajes.filter((msg) => !msg.leido).length;

  return (
    <div className="bandeja-layout">
      <aside className="bandeja-menu">
        <div
          className={`menu-item ${bandejaActiva === 'entrada' ? 'activo' : ''}`}
          onClick={() => setBandejaActiva('entrada')}
        >
          Bandeja de entrada
          {mensajesNoLeidos > 0 && <span className="bandeja-badge">{mensajesNoLeidos}</span>}
        </div>
        <div
          className={`menu-item ${bandejaActiva === 'salida' ? 'activo' : ''}`}
          onClick={() => setBandejaActiva('salida')}
        >
          Bandeja de salida
        </div>
      </aside>

      <main className="bandeja-contenido">
        {bandejaActiva === 'entrada' ? (
          <>
            <h2>Mensajes Recibidos</h2>
            <div className="bandeja-filtros">
              <input
                type="text"
                placeholder="Filtrar por remitente"
                value={filtros.remitente}
                onChange={(e) => setFiltros({ ...filtros, remitente: e.target.value })}
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
              <button className="nuevo-mensaje-btn" onClick={() => setMostrarModal(true)}>
                Nuevo Mensaje
              </button>
            </div>

            {mensajesFiltrados.length === 0 ? (
              <p>No hay mensajes</p>
            ) : (
              <table className="bandeja-tabla">
                <thead>
                  <tr>
                    <th>Remitente</th>
                    <th>Fecha</th>
                    <th>Asunto</th>
                    <th>Leído</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {mensajesFiltrados.map((msg) => (
                    <tr key={msg.id} className={msg.leido ? '' : 'no-leido'}>
                      <td>{msg.remitente}</td>
                      <td>{new Date(msg.fecha_envio).toLocaleString()}</td>
                      <td>{msg.asunto}</td>
                      <td>{msg.leido ? 'Sí' : 'No'}</td>
                      <td>
                        {!msg.leido && (
                          <button onClick={() => marcarComoLeido(msg.id)}>
                            Marcar como leído
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : (
          <BandejaSalida onClose={() => setBandejaActiva('entrada')} />
        )}
      </main>

      {mostrarModal && (
        <EnviarMensajeModal
          onClose={() => setMostrarModal(false)}
          onSent={fetchMensajes}
        />
      )}
    </div>
  );
}

export default BandejaEntrada;