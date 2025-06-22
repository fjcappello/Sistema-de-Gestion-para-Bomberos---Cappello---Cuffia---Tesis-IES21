import React, { useState, useEffect } from "react";
import api from "../api";
import "./Styles/Configuracion.css"; // Conservamos el estilo actual

function Auditoria() {
  const [bitacora, setBitacora] = useState([]);
  const [filtros, setFiltros] = useState({
    usuario_id: "",
    accion: "",
    desde: "",
    hasta: "",
  });
  const [pagina, setPagina] = useState(1);
  const registrosPorPagina = 5;

  const fetchBitacora = async () => {
    try {
      const params = {};
      if (filtros.usuario_id) params.usuario_id = filtros.usuario_id;
      if (filtros.accion) params.accion = filtros.accion;
      if (filtros.desde) params.desde = filtros.desde;
      if (filtros.hasta) params.hasta = filtros.hasta;

      const response = await api.get("/registro_seguridad", { params });
      setBitacora(response.data);
    } catch (err) {
      console.error("Error al obtener bitácora:", err);
    }
  };

  useEffect(() => {
    fetchBitacora();
  }, [filtros]);

  const inicio = (pagina - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const registrosPaginados = bitacora.slice(inicio, fin);

  return (
    <div className="configuracion-layout">
      <main className="configuracion-contenido">
        <h2>Historial de Auditoría</h2>
        <div className="configuracion-filtros">
          <input
            type="text"
            placeholder="Legajo"
            value={filtros.usuario_id}
            onChange={(e) =>
              setFiltros({ ...filtros, usuario_id: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Acción"
            value={filtros.accion}
            onChange={(e) => setFiltros({ ...filtros, accion: e.target.value })}
          />
          <input
            type="date"
            value={filtros.desde}
            onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
          />
          <input
            type="date"
            value={filtros.hasta}
            onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
          />
          <button
            className="nuevo-mensaje-btn"
            onClick={() =>
              setFiltros({
                usuario_id: "",
                accion: "",
                desde: "",
                hasta: "",
              })
            }
          >
            Limpiar
          </button>
          <button
            className="nuevo-mensaje-btn"
            onClick={() => {
              import("xlsx").then((xlsx) => {
                const datos = bitacora.map(
                  ({ id, usuario_id, usuario, fecha, accion }) => {
                    return {
                      "Fecha y Hora": fecha,
                      Legajo: usuario_id,
                      Personal: usuario || "",
                      Acción: accion,
                    };
                  }
                );

                const ahora = new Date();
                const formatoFecha = ahora
                  .toLocaleDateString("es-AR")
                  .replace(/\//g, "-");
                const formatoHora = ahora
                  .toLocaleTimeString("es-AR", { hour12: false })
                  .replace(/:/g, "-");

                const worksheet = xlsx.utils.json_to_sheet(datos);
                const workbook = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(workbook, worksheet, "Auditoria");
                xlsx.writeFile(
                  workbook,
                  `auditoria_${formatoFecha}_${formatoHora}.xlsx`
                );
              });
            }}
          >
            Exportar Excel
          </button>
        </div>
        <table className="configuracion-tabla">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Legajo</th>
              <th>Personal</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {registrosPaginados.map((item) => (
              <tr key={item.id}>
                <td>{item.fecha}</td>
                <td>{item.usuario_id}</td>
                <td>{item.usuario}</td>
                <td>{item.accion}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="paginacion">
          <button
            onClick={() => setPagina((p) => Math.max(p - 1, 1))}
            disabled={pagina === 1}
          >
            Anterior
          </button>
          <span>Página {pagina}</span>
          <button
            onClick={() =>
              setPagina((p) =>
                p * registrosPorPagina < bitacora.length ? p + 1 : p
              )
            }
            disabled={pagina * registrosPorPagina >= bitacora.length}
          >
            Siguiente
          </button>
        </div>
      </main>
    </div>
  );
}

export default Auditoria;
