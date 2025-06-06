import React, { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../api";
import EnviarMensajeModal from "./EnviarMensajeModal";
import BandejaSalida from "./BandejaSalida";
import "./Styles/BandejaEntrada.css";

function BandejaEntrada() {
  const [mensajes, setMensajes] = useState([]);
  const [filtros, setFiltros] = useState({
    remitente: "",
    asunto: "",
    fecha: "",
  });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [bandejaActiva, setBandejaActiva] = useState("entrada");
  const [mensajeActivoId, setMensajeActivoId] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const mensajesPorPagina = 5;
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const legajo = usuario?.legajo;

  const fetchMensajes = () => {
    if (legajo) {
      axios
        .get(`${api}/mensajes/recibidos/${legajo}`)
        .then((res) => setMensajes(res.data))
        .catch((err) => console.error("Error al obtener mensajes", err));
    }
  };

  useEffect(() => {
    fetchMensajes();
  }, [legajo]);

  const marcarComoLeido = async (id) => {
    try {
      await axios.put(`${api}/mensajes/marcar-leido/${id}`, {
        destinatario_id: legajo,
      });
      setMensajes((prev) =>
        prev.map((m) => (m.id === id ? { ...m, leido: 1 } : m))
      );
    } catch (error) {
      console.error("Error al marcar como leído", error);
    }
  };

  const mensajesFiltrados = mensajes.filter(
    (msg) =>
      msg.remitente.toLowerCase().includes(filtros.remitente.toLowerCase()) &&
      msg.asunto.toLowerCase().includes(filtros.asunto.toLowerCase()) &&
      msg.fecha_envio.includes(filtros.fecha)
  );

  const mensajesNoLeidos = mensajes.filter((msg) => !msg.leido).length;

  const handleRowClick = (msg) => {
    setMensajeActivoId(msg.id);
    if (!msg.leido) {
      marcarComoLeido(msg.id);
    }
  };

  const indiceInicial = (paginaActual - 1) * mensajesPorPagina;
  const indiceFinal = indiceInicial + mensajesPorPagina;
  const mensajesPaginados = mensajesFiltrados.slice(indiceInicial, indiceFinal);

  return (
    <div className="bandeja-layout">
      <main className="bandeja-contenido">
        <div className="bandeja-selector">
          <div
            className={`menu-item ${
              bandejaActiva === "entrada" ? "activo" : ""
            }`}
            onClick={() => setBandejaActiva("entrada")}
          >
            Bandeja de entrada
            {mensajesNoLeidos > 0 && (
              <span className="bandeja-badge">{mensajesNoLeidos}</span>
            )}
          </div>
          <div
            className={`menu-item ${
              bandejaActiva === "salida" ? "activo" : ""
            }`}
            onClick={() => setBandejaActiva("salida")}
          >
            Bandeja de salida
          </div>
        </div>

        {bandejaActiva === "entrada" ? (
          <>
            <h2>Mensajes Recibidos</h2>
            <div className="bandeja-filtros">
              <input
                type="text"
                placeholder="Filtrar por remitente"
                value={filtros.remitente}
                onChange={(e) =>
                  setFiltros({ ...filtros, remitente: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Filtrar por asunto"
                value={filtros.asunto}
                onChange={(e) =>
                  setFiltros({ ...filtros, asunto: e.target.value })
                }
              />
              <input
                type="date"
                value={filtros.fecha}
                onChange={(e) =>
                  setFiltros({ ...filtros, fecha: e.target.value })
                }
              />
              <button
                className="nuevo-mensaje-btn"
                onClick={() => setMostrarModal(true)}
              >
                Nuevo Mensaje
              </button>
            </div>

            {mensajesPaginados.length === 0 ? (
              <p>No hay mensajes</p>
            ) : (
              <table className="bandeja-tabla">
                <thead>
                  <tr>
                    <th>Remitente</th>
                    <th>Fecha</th>
                    <th>Asunto</th>
                  </tr>
                </thead>
                <tbody>
                  {mensajesPaginados.map((msg) => (
                    <React.Fragment key={msg.id}>
                      <tr
                        onClick={() => handleRowClick(msg)}
                        className={msg.leido ? "" : "no-leido"}
                      >
                        <td>{msg.remitente || msg.remitente_id}</td>
                        <td>{new Date(msg.fecha_envio).toLocaleString()}</td>
                        <td>{msg.asunto}</td>
                      </tr>
                      {mensajeActivoId === msg.id && (
                        <tr>
                          <td colSpan="3">{msg.cuerpo}</td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
            <div className="paginacion">
              <button
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>
              <span>Página {paginaActual}</span>
              <button
                onClick={() =>
                  setPaginaActual((prev) =>
                    prev <
                    Math.ceil(mensajesFiltrados.length / mensajesPorPagina)
                      ? prev + 1
                      : prev
                  )
                }
                disabled={
                  paginaActual >=
                  Math.ceil(mensajesFiltrados.length / mensajesPorPagina)
                }
              >
                Siguiente
              </button>
            </div>
          </>
        ) : (
          <BandejaSalida onClose={() => setBandejaActiva("entrada")} />
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
