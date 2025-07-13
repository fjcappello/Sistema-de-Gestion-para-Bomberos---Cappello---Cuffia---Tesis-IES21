import React, { useEffect, useState } from "react";
import api from "../api";
import "./Styles/BandejaEntrada.css";
import { useUsuario } from "../context/UserContext";

function BandejaSalida({ onClose }) {
  const { usuario } = useUsuario();
  const legajo = usuario?.legajo;
  const [mensajes, setMensajes] = useState([]);
  const [filtros, setFiltros] = useState({
    destinatarios: "",
    asunto: "",
    fecha: "",
  });
  const [mensajeActivoId, setMensajeActivoId] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const mensajesPorPagina = 5;

  useEffect(() => {
    if (legajo) {
      api
        .get(`/mensajes/enviados/${legajo}`)
        .then((res) => setMensajes(res.data))
        .catch((err) =>
          console.error("Error al obtener mensajes enviados", err)
        );
    }
  }, [legajo]);

  const mensajesFiltrados = mensajes.filter(
    (msg) =>
      msg.destinatarios
        .toLowerCase()
        .includes(filtros.destinatarios.toLowerCase()) &&
      msg.asunto.toLowerCase().includes(filtros.asunto.toLowerCase()) &&
      msg.fecha_envio.includes(filtros.fecha)
  );

  const indiceInicial = (paginaActual - 1) * mensajesPorPagina;
  const indiceFinal = indiceInicial + mensajesPorPagina;
  const mensajesPaginados = mensajesFiltrados.slice(indiceInicial, indiceFinal);

  const handleRowClick = (msg) => {
    setMensajeActivoId(mensajeActivoId === msg.id ? null : msg.id);
  };

  return (
    <div className="table-container">
      <h2 className="table-title">Mensajes enviados</h2>

      <div className="filtros">
        <input
          type="text"
          placeholder="Filtrar por destinatarios"
          value={filtros.destinatarios}
          onChange={(e) =>
            setFiltros({ ...filtros, destinatarios: e.target.value })
          }
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

        <button>Limpiar Filtros</button>
      </div>

      {mensajesPaginados.length === 0 ? (
        <p>No hay mensajes enviados</p>
      ) : (
        <table className="bandeja-tabla">
          <thead>
            <tr>
              <th>Destinatarios</th>
              <th>Fecha</th>
              <th>Asunto</th>
            </tr>
          </thead>
          <tbody>
            {mensajesPaginados.map((msg) => (
              <React.Fragment key={msg.id}>
                <tr
                  onClick={() => handleRowClick(msg)}
                  className={mensajeActivoId === msg.id ? "mensaje-activo" : ""}
                  style={{ cursor: "pointer" }}
                >
                  <td>
                    {Array.isArray(msg.destinatarios)
                      ? msg.destinatarios.join(", ")
                      : msg.destinatarios}
                  </td>
                  <td>{new Date(msg.fecha_envio).toLocaleString()}</td>
                  <td>{msg.asunto}</td>
                </tr>
                {mensajeActivoId === msg.id && (
                  <tr>
                    <td colSpan="3">
                      <div className="mensaje-detalle">{msg.cuerpo}</div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      )}
      <div className="pagination">
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
              prev < Math.ceil(mensajesFiltrados.length / mensajesPorPagina)
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
    </div>
  );
}

export default BandejaSalida;
