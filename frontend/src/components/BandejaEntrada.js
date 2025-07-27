import React, { useEffect, useState } from "react";
import api from "../api";
import EnviarMensajeModal from "./EnviarMensajeModal";
import BandejaSalida from "./BandejaSalida";
import "./Styles/BandejaEntrada.css";
import { useUsuario } from "../context/UserContext";

function BandejaEntrada() {
  const [mensajes, setMensajes] = useState([]);
  const [filtrosInput, setFiltrosInput] = useState({
    remitente: "",
    asunto: "",
    fecha: "",
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    remitente: "",
    asunto: "",
    fecha: "",
  });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [bandejaActiva, setBandejaActiva] = useState("entrada");
  const [mensajeActivoId, setMensajeActivoId] = useState(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const { usuario } = useUsuario();
  const mensajesPorPagina = 5;
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
  }, [legajo]);

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
          msg.remitente.toLowerCase().includes(filtrosAplicados.remitente.toLowerCase()) &&
          msg.asunto.toLowerCase().includes(filtrosAplicados.asunto.toLowerCase()) &&
          msg.fecha_envio.includes(filtrosAplicados.fecha)
      )
    : [];

  const mensajesNoLeidos = Array.isArray(mensajes)
    ? mensajes.filter((msg) => !msg.leido).length
    : 0;

  const handleRowClick = (msg) => {
    setMensajeActivoId((activo) => (activo === msg.id ? null : msg.id));
    if (!msg.leido) {
      marcarComoLeido(msg.id);
    }
  };

  const indiceInicial = (paginaActual - 1) * mensajesPorPagina;
  const indiceFinal = indiceInicial + mensajesPorPagina;
  const totalPaginas = Math.ceil(mensajesFiltrados.length / mensajesPorPagina);
  const mensajesPaginados = mensajesFiltrados.slice(indiceInicial, indiceFinal);

  // Aplica los filtros ingresados
  const aplicarFiltros = () => {
    setFiltrosAplicados(filtrosInput);
    setPaginaActual(1); 
  };

  // Limpia filtros y muestra todo
  const limpiarFiltros = () => {
    const filtrosVacios = { remitente: "", asunto: "", fecha: "" };
    setFiltrosInput(filtrosVacios);
    setFiltrosAplicados(filtrosVacios);
    setPaginaActual(1);
  };

  

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
          <div className="table-container">
            <h2 className="table-title">Mensajes Recibidos</h2>
            <div className="botonera_tablas">
              <button
                className="add-report-btn"
                onClick={() => setMostrarModal(true)}
              >
                Nuevo Mensaje
              </button>
            </div>
            <div className="filtros">
              <input
                type="text"
                placeholder="Filtrar por remitente"
                value={filtrosInput.remitente}
                onChange={(e) =>
                  setFiltrosInput({ ...filtrosInput, remitente: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Filtrar por asunto"
                value={filtrosInput.asunto}
                onChange={(e) =>
                  setFiltrosInput({ ...filtrosInput, asunto: e.target.value })
                }
              />
              <input
                type="date"
                value={filtrosInput.fecha}
                onChange={(e) =>
                  setFiltrosInput({ ...filtrosInput, fecha: e.target.value })
                }
              />
              <button onClick={aplicarFiltros}>Aplicar filtros</button>
              <button onClick={limpiarFiltros}>Limpiar filtros</button>
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
                        style={{ cursor: "pointer" }}
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
            <div className="pagination">
              <button
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
              >
                Anterior
              </button>
              <span>Página {paginaActual} de {totalPaginas}</span>
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
          </div>
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
