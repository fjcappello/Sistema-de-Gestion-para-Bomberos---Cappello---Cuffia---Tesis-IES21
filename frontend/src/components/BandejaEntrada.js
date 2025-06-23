import React, { useEffect, useState } from "react";
import api from "../api";
import EnviarMensajeModal from "./EnviarMensajeModal"; // Se refactorizará después
import BandejaSalida from "./BandejaSalida"; // Se revisará después
import "./Styles/BandejaEntrada.css"; // Estilos Fluent

function BandejaEntrada() {
  const [mensajes, setMensajes] = useState([]);
  const [filtros, setFiltros] = useState({
    remitente: "",
    asunto: "",
    fecha: "",
  });
  const [mostrarModalEnviar, setMostrarModalEnviar] = useState(false); // Renombrado para claridad
  const [bandejaActiva, setBandejaActiva] = useState("entrada");
  const [mensajeActivoId, setMensajeActivoId] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const mensajesPorPagina = 7; // Aumentar un poco
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const legajo = usuario?.legajo;

  const fetchMensajes = () => {
    if (legajo) {
      api
        .get(`/mensajes/recibidos/${legajo}`)
        .then((res) => {
          setMensajes(res.data);
        })
        .catch((err) => console.error("Error al obtener mensajes", err));
    }
  };

  useEffect(() => {
    fetchMensajes();
    // Considerar si el polling cada 3 segundos es necesario o si se puede usar WebSocket o un botón de actualizar.
    // Por ahora, se mantiene para consistencia con el original.
    // const interval = setInterval(fetchMensajes, 3000);
    // return () => clearInterval(interval);
  }, [legajo]); // Dependencia solo de legajo para carga inicial

  const marcarComoLeido = async (id) => {
    try {
      await api.put(`/mensajes/marcar-leido/${id}`, {
        destinatario_id: legajo,
      });
      setMensajes((prev) =>
        prev.map((m) => (m.id === id ? { ...m, leido: 1 } : m))
      );
    } catch (error) {
      console.error("Error al marcar como leído", error);
    }
  };

  const mensajesFiltrados = Array.isArray(mensajes)
    ? mensajes.filter(
        (msg) =>
          (msg.remitente_nombre_completo || msg.remitente || '').toLowerCase().includes(filtros.remitente.toLowerCase()) &&
          (msg.asunto || '').toLowerCase().includes(filtros.asunto.toLowerCase()) &&
          (msg.fecha_envio || '').includes(filtros.fecha)
      )
    : [];

  const mensajesNoLeidos = Array.isArray(mensajes)
    ? mensajes.filter((msg) => !msg.leido).length
    : 0;

  const handleRowClick = (msg) => {
    setMensajeActivoId(mensajeActivoId === msg.id ? null : msg.id); // Toggle para mostrar/ocultar
    if (!msg.leido && (mensajeActivoId !== msg.id || !mensajeActivoId) ) { // Marcar solo si se abre o estaba cerrado
      marcarComoLeido(msg.id);
    }
  };

  const indiceUltimoMensaje = paginaActual * mensajesPorPagina;
  const indicePrimerMensaje = indiceUltimoMensaje - mensajesPorPagina;
  const mensajesPaginados = mensajesFiltrados.slice(indicePrimerMensaje, indiceUltimoMensaje);
  const totalPaginas = Math.ceil(mensajesFiltrados.length / mensajesPorPagina);


  return (
    // Opcional: <div className="card-fluent bandeja-entrada-container"> <div className="card-body-fluent"> ... </div> </div>
    // Por ahora, se asume que se renderiza directamente en .main-content
    <div className="bandeja-entrada-view"> {/* Contenedor principal de la vista */}
      <div className="bandeja-selector">
        <button // Cambiado a button para mejor semántica y accesibilidad
          className={`bandeja-menu-item ${bandejaActiva === "entrada" ? "active" : ""}`}
          onClick={() => setBandejaActiva("entrada")}
        >
          Bandeja de entrada
          {mensajesNoLeidos > 0 && (
            <span className="bandeja-badge-fluent">{mensajesNoLeidos}</span>
          )}
        </button>
        <button // Cambiado a button
          className={`bandeja-menu-item ${bandejaActiva === "salida" ? "active" : ""}`}
          onClick={() => setBandejaActiva("salida")}
        >
          Bandeja de salida
        </button>
      </div>

      {bandejaActiva === "entrada" ? (
        <>
          <h2 className="bandeja-section-title">Mensajes Recibidos</h2>
          <div className="bandeja-filtros">
            <input
              type="text"
              placeholder="Filtrar por remitente"
              className="form-control-fluent"
              value={filtros.remitente}
              onChange={(e) => setFiltros({ ...filtros, remitente: e.target.value })}
            />
            <input
              type="text"
              placeholder="Filtrar por asunto"
              className="form-control-fluent"
              value={filtros.asunto}
              onChange={(e) => setFiltros({ ...filtros, asunto: e.target.value })}
            />
            <input
              type="date"
              className="form-control-fluent"
              value={filtros.fecha}
              onChange={(e) => setFiltros({ ...filtros, fecha: e.target.value })}
            />
            <button
              className="btn-fluent btn-fluent-primary" // Botón Fluent
              onClick={() => setMostrarModalEnviar(true)}
            >
              Nuevo Mensaje
            </button>
          </div>

          {mensajesPaginados.length === 0 ? (
            <p>No hay mensajes en la bandeja de entrada.</p>
          ) : (
            <>
              <table className="table-fluent bandeja-tabla"> {/* Tabla Fluent */}
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
                        className={`${!msg.leido ? "no-leido" : ""} ${mensajeActivoId === msg.id ? "fila-activa" : ""}`} // Clase para fila activa si se quiere
                        style={{cursor: 'pointer'}}
                      >
                        <td>{msg.remitente_nombre_completo || msg.remitente_id || "Desconocido"}</td>
                        <td>{new Date(msg.fecha_envio).toLocaleString('es-AR', {dateStyle:'short', timeStyle:'short'})}</td>
                        <td>{msg.asunto}</td>
                      </tr>
                      {mensajeActivoId === msg.id && (
                        <tr className="mensaje-detalle-fila">
                          <td colSpan="3">{msg.cuerpo}</td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              <div className="pagination">
                <button
                  onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                  disabled={paginaActual === 1}
                  className="btn-fluent btn-fluent-outline" // Botón Fluent
                >
                  Anterior
                </button>
                <span>Página {paginaActual} de {totalPaginas > 0 ? totalPaginas : 1}</span>
                <button
                  onClick={() => setPaginaActual((prev) => prev < totalPaginas ? prev + 1 : prev) }
                  disabled={paginaActual >= totalPaginas}
                  className="btn-fluent btn-fluent-outline" // Botón Fluent
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <BandejaSalida onClose={() => setBandejaActiva("entrada")} />
      )}

      {mostrarModalEnviar && ( // Nombre de estado actualizado
        <EnviarMensajeModal
          onClose={() => setMostrarModalEnviar(false)}
          onSent={() => {
            fetchMensajes(); // Actualizar mensajes después de enviar
            setMostrarModalEnviar(false); // Cerrar modal
          }}
        />
      )}
    </div>
  );
}

export default BandejaEntrada;
