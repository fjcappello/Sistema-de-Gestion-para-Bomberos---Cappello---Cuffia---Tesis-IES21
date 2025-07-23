import React, { useEffect, useState } from "react";
import api from "../api";
import * as XLSX from "xlsx";
import "./Styles/MovimientoMoviles.css";
import "./Styles/Tablas.css";
import "./Styles/MovimientosPersonas.css";

// Formato de fecha
const formatFecha = (fechaStr) => {
  const fecha = new Date(fechaStr);
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();
  const hora = String(fecha.getHours()).padStart(2, "0");
  const minuto = String(fecha.getMinutes()).padStart(2, "0");
  return `${dia}/${mes}/${anio} ${hora}:${minuto}`;
};

function MovimientoMoviles() {
  const [movimientos, setMovimientos] = useState([]);
  
  const [filtros, setFiltros] = useState({
    interno: "",
    fechaDesde: "",
    fechaHasta: "",
  });
  
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    interno: "",
    fechaDesde: "",
    fechaHasta: "",
  });
  
  const [mostrarModalSalida, setMostrarModalSalida] = useState(false);
  const [mostrarModalRetorno, setMostrarModalRetorno] = useState(false);
  const [moviles, setMoviles] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [movimientoSeleccionado, setMovimientoSeleccionado] = useState(null);
  const [novedadSeleccionada, setNovedadSeleccionada] = useState(null);
  const [busquedaDotacion, setBusquedaDotacion] = useState("");
  const [erroresSalida, setErroresSalida] = useState({});
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 5;

  const [formSalida, setFormSalida] = useState({
    movil_id: "",
    chofer_id: "",
    destino: "",
    jefe_dotacion: "",
    dotacion: [],
  });

  const [formRetorno, setFormRetorno] = useState({
    kilometraje_final: "",
    novedades: "",
  });

  useEffect(() => {
    cargarMovimientos();
    cargarMoviles();
    cargarPersonal();
  }, []);

  // Obtencion de los moviles (Activos)
  const cargarMoviles = async () => {
    const response = await api.get("/moviles");
    setMoviles(response.data.filter((m) => m.estado_id === 1));
  };

  const cargarPersonal = async () => {
    const response = await api.get("/personal");
    setPersonal(response.data);
  };

  // Asoscia movimientos con el id de movil y el personal
  const cargarMovimientos = async () => {
    const response = await api.get("/moviles_movimientos");
    const movimientosConMovilId = response.data.map((mov) => {
      const movil = moviles.find((m) => m.interno === mov.interno);
      return {
        ...mov,
        movil_id: movil ? movil.id : null,
        jefe_dotacion: mov.jefe_dotacion,
      };
    });
    setMovimientos(movimientosConMovilId);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  // Seccion de manejo de filtros, aplicando los que se completaron y reinicia la pagina
  const aplicarFiltros = () => {
    setFiltrosAplicados({ ...filtros });
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setFiltros({
      interno: "",
      fechaDesde: "",
      fechaHasta: "",
    });
    setFiltrosAplicados({
      interno: "",
      fechaDesde: "",
      fechaHasta: "",
    });
    setPaginaActual(1);
  };

  const handleFormSalidaChange = (e) => {
    const { name, value } = e.target;
    setFormSalida((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormRetornoChange = (e) => {
    const { name, value } = e.target;
    setFormRetorno((prev) => ({ ...prev, [name]: value }));
  };

  const handleDotacionChange = (e) => {
    const value = Array.from(e.target.selectedOptions, (opt) =>
      parseInt(opt.value)
    );
    setFormSalida((prev) => ({ ...prev, dotacion: value }));
  };

  // Carga de dotacion al movil
  const agregarADotacion = () => {
    const match = personal.find((p) =>
      p.nombre_completo?.toLowerCase().includes(busquedaDotacion.toLowerCase())
    );
    if (match && !formSalida.dotacion.includes(match.legajo)) {
      setFormSalida((prev) => ({
        ...prev,
        dotacion: [...prev.dotacion, match.legajo],
      }));
      setBusquedaDotacion("");
    }
  };

  //Funcion de formulario para registrar una salida
  const handleSubmitSalida = (e) => {
  e.preventDefault(); 
  registrarSalida();  
  };

  //Funcion de formulario para registrar un retorno
  const handleRegistrarRetorno = (e) => {
    e.preventDefault();
    registrarRetorno();
  }

  // Registro de salida del movil
  const registrarSalida = async () => {
    const nuevosErrores = {};
    if (!formSalida.movil_id) nuevosErrores.movil_id = true;
    if (!formSalida.chofer_id) nuevosErrores.chofer_id = true;
    if (!formSalida.destino.trim()) nuevosErrores.destino = true;

    setErroresSalida(nuevosErrores);

    if (Object.keys(nuevosErrores).length > 0) {
      alert("Debe completar todos los campos obligatorios.");
      return;
    }

    // Verificamos si ya existe una salida activa para el móvil
    // Si hay una salida activa, no se puede registrar una nueva
    const salidaActiva = movimientos.some(
      (m) =>
        m.movil_id?.toString() === formSalida.movil_id &&
        (!m.fecha_retorno ||
          m.fecha_retorno === "0000-00-00 00:00:00" ||
          m.kilometraje_final === null)
    );
    if (salidaActiva) {
      alert(
        "Ya existe una salida activa para este móvil. Debe registrar el retorno antes de crear una nueva."
      );
      return;
    }

    try {
      await api.post("/moviles_salida", { ...formSalida });
      cargarMovimientos();
      setMostrarModalSalida(false);
      setFormSalida({
        movil_id: "",
        chofer_id: "",
        destino: "",
        jefe_dotacion: "",
        dotacion: [],
      });
      setErroresSalida({});
      cargarMovimientos();
    } catch (err) {
      alert("Error al registrar salida");
    }
  };

  // Registro de retorno del movil
  // Se verifica que el kilometraje final sea mayor al de salida
  const registrarRetorno = async () => {
    try {
      await api.put(
        `/moviles_retorno/${movimientoSeleccionado.id}`,
        formRetorno
      );

      cargarMovimientos();
      setMostrarModalRetorno(false);
      setFormRetorno({ kilometraje_final: "", novedades: "" });
    } catch (err) {
      console.error("Error real al registrar retorno:", err);
      if (err.response) {
        alert(
          `Error al registrar retorno: ${
            err.response.data?.error || err.response.statusText
          }`
        );
      } else if (err.request) {
        alert(
          "Error al registrar retorno: No se recibió respuesta del servidor."
        );
      } else {
        alert(`Error desconocido: ${err.message}`);
      }
    }
  };

  const movimientosFiltrados = movimientos.filter((m) => {
    const coincideInterno =
      filtrosAplicados.interno === "" || m.interno === filtrosAplicados.interno;
    const fechaSalida = new Date(m.fecha_salida);
    const desde = filtrosAplicados.fechaDesde ? new Date(filtrosAplicados.fechaDesde) : null;
    const hasta = filtrosAplicados.fechaHasta ? new Date(filtrosAplicados.fechaHasta) : null;
    const coincideFecha =
      (!desde || fechaSalida >= desde) && (!hasta || fechaSalida <= hasta);
    return coincideInterno && coincideFecha;
  });

  const movimientosPaginados = movimientosFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  // Funcion para exportar los movimientos a Excel
  // Si hay filtros aplicados, se exportan los movimientos filtrados

  const exportarAExcel = () => {
    const data = movimientosFiltrados.map((m) => {
      const jefe = personal.find((p) => p.legajo === m.jefe_dotacion);
      const dotacionCompleta =
        Array.isArray(m.dotacion) && m.dotacion.length > 0
          ? m.dotacion
              .map((id) => {
                const p = personal.find((pers) => pers.legajo === id);
                return p ? p.nombre_completo : `Legajo ${id}`;
              })
              .join(", ")
          : "Sin dotación acompañante";

      return {
        Interno: m.interno,
        "Fecha salida": formatFecha(m.fecha_salida),
        Chofer: m.chofer,
        Destino: m.destino,
        "Kilometraje salida": m.km_salida || "",
        "Jefe de dotación": jefe ? jefe.nombre_completo : "",
        Dotación: dotacionCompleta,
        "Fecha retorno": m.fecha_retorno ? formatFecha(m.fecha_retorno) : "",
        "Kilometraje final": m.kilometraje_final || "",
        Novedades: m.novedades?.trim() ? m.novedades : "Sin novedades",
      };
    });

    const hoja = XLSX.utils.json_to_sheet(data);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Movimientos");
    XLSX.writeFile(libro, "movimientos_móviles.xlsx");
  };

  return (
    <div className="table-container">
      <h2 className="table-title">Movimientos de móviles</h2>
      <div className="botonera_tablas">
        <button onClick={() => setMostrarModalSalida(true)} className="add-report-btn">
          Registrar salida
        </button>
        <button onClick={exportarAExcel} className="add-report-btn">
          Exportar a Excel
        </button>
      </div>
      
      <div className="filtros">
        <select
          name="interno"
          value={filtros.interno}
          onChange={handleFiltroChange}
        >
          <option value="">Todos los internos</option>
          {moviles.map((m) => (
            <option key={m.id} value={m.interno}>
              {m.interno}
            </option>
          ))}
        </select>
        <label>Fecha desde:</label>
        <input
          type="date"
          name="fechaDesde"
          value={filtros.fechaDesde || ""}
          onChange={handleFiltroChange}
        />
        <label>Fecha hasta:</label>
        <input
          type="date"
          name="fechaHasta"
          value={filtros.fechaHasta || ""}
          onChange={handleFiltroChange}
        />
        <button onClick={aplicarFiltros} className="filter-btn">
          Aplicar filtros
        </button>
        <button onClick={limpiarFiltros} className="filter-btn">
          Limpiar filtros
        </button>
      </div>

      <table className="table-fluent">
        <thead>
          <tr>
            <th>Interno</th>
            <th>Salida</th>
            <th>Chofer</th>
            <th>Destino</th>
            <th>Kilometraje salida</th>
            <th>Jefe de dotación</th>
            <th>Retorno</th>
            <th>Kilometraje final</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movimientosPaginados.map((m) => (
            <tr key={m.id}>
              <td>{m.interno}</td>
              <td>{formatFecha(m.fecha_salida)}</td>
              <td>{m.chofer}</td>
              <td>{m.destino}</td>
              <td>{m.km_salida || "-"}</td>
              <td>
                {(() => {
                  const jefe = personal.find(
                    (p) => p.legajo === m.jefe_dotacion
                  );
                  return jefe ? jefe.nombre_completo : "-";
                })()}
              </td>
              <td>{m.fecha_retorno ? formatFecha(m.fecha_retorno) : "-"}</td>
              <td>{m.kilometraje_final || "-"}</td>
              <td>
                {!m.fecha_retorno ||
                m.fecha_retorno === "0000-00-00 00:00:00" ||
                m.kilometraje_final === null ? (
                  <div className="botonera_accion_tabla">
                    <button
                      className="btn-retorno"
                      onClick={() => {
                        setMovimientoSeleccionado(m);
                        setMostrarModalRetorno(true);
                      }}
                    >
                      Registrar retorno
                    </button>
                  </div>
                  ) : (
                    <div className="botonera_accion_tabla">
                    <button
                      className="btn-retorno"
                      title="Ver novedades registradas"
                      onClick={() =>
                        setNovedadSeleccionada(
                          m.novedades || "Sin novedades registradas"
                        )
                      }
                    >
                      Novedades
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button
          onClick={() => setPaginaActual((p) => Math.max(p - 1, 1))}
          disabled={paginaActual === 1}
        >
          Anterior
        </button>
        <span>Página {paginaActual} de {Math.ceil(movimientosFiltrados.length / registrosPorPagina)}</span>
        <button
          onClick={() =>
            setPaginaActual((p) =>
              p < Math.ceil(movimientosFiltrados.length / registrosPorPagina)
                ? p + 1
                : p
            )
          }
          disabled={
            paginaActual ===
            Math.ceil(movimientosFiltrados.length / registrosPorPagina)
          }
        >
          Siguiente
        </button>
      </div>

      {mostrarModalSalida && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Registrar salida</h3>
            <form className="form-container" onSubmit={handleSubmitSalida}>
              <select
                name="movil_id"
                className={erroresSalida.movil_id ? "input-error" : ""}
                value={formSalida.movil_id}
                onChange={handleFormSalidaChange}
              >
                <option value="">Seleccione móvil</option>
                {moviles.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.interno}
                  </option>
                ))}
              </select>
              <select
                name="chofer_id"
                className={erroresSalida.chofer_id ? "input-error" : ""}
                value={formSalida.chofer_id}
                onChange={handleFormSalidaChange}
              >
                <option value="">Seleccione chofer</option>
                {personal.map((p) => (
                  <option key={p.legajo} value={p.legajo}>
                    {p.nombre_completo || `Legajo ${p.legajo}`}
                  </option>
                ))}
              </select>
              <select
                name="jefe_dotacion"
                value={formSalida.jefe_dotacion}
                onChange={handleFormSalidaChange}
              >
                <option value="">Seleccione jefe de dotación</option>
                {personal.map((p) => (
                  <option key={p.legajo} value={p.legajo}>
                    {p.nombre_completo || `Legajo ${p.legajo}`}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="destino"
                className={erroresSalida.destino ? "input-error" : ""}
                placeholder="Destino"
                value={formSalida.destino}
                onChange={handleFormSalidaChange}
              />
              <label>Seleccione dotación (opcional)</label>
              <input
                type="text"
                placeholder="Buscar personal"
                value={busquedaDotacion}
                onChange={(e) => setBusquedaDotacion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && agregarADotacion()}
              />
              {busquedaDotacion && (
                <ul className="sugerencias-dotacion">
                  {personal
                    .filter(
                      (p) =>
                        p.nombre_completo
                          ?.toLowerCase()
                          .includes(busquedaDotacion.toLowerCase()) &&
                        !formSalida.dotacion.includes(p.legajo)
                    )
                    .slice(0, 5)
                    .map((p) => (
                      <li
                        key={p.legajo}
                        onClick={() => {
                          setFormSalida((prev) => ({
                            ...prev,
                            dotacion: [...prev.dotacion, p.legajo],
                          }));
                          setBusquedaDotacion("");
                        }}
                      >
                        {p.nombre_completo}
                      </li>
                    ))}
                </ul>
              )}
              <button className="confirm-btn" type="button" onClick={agregarADotacion}>
                Agregar a dotación
              </button>
              <ul>
                {formSalida.dotacion.map((legajo) => {
                  const persona = personal.find((p) => p.legajo === legajo);
                  return (
                    <li key={legajo}>
                      {persona?.nombre_completo || `Legajo ${legajo}`}
                      <button
                        className="btn-eliminar"
                        onClick={() => {
                          setFormSalida((prev) => ({
                            ...prev,
                            dotacion: prev.dotacion.filter((l) => l !== legajo),
                          }));
                        }}
                      >
                        ✖
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="form-buttons">
                <button className="submit-btn" type="submit">Guardar</button>
                <button className="cancel-btn" onClick={() => setMostrarModalSalida(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarModalRetorno && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Registrar retorno</h3>
            <form className="form-container" onSubmit={handleRegistrarRetorno}>
              <input
                type="number"
                min={0}
                name="kilometraje_final"
                placeholder="Kilometraje final"
                value={formRetorno.kilometraje_final}
                onChange={handleFormRetornoChange}
              />
              <textarea
                name="novedades"
                placeholder="Escriba aqui las novedades"
                value={formRetorno.novedades}
                onChange={handleFormRetornoChange}
              ></textarea>
              <div className="form-buttons">
                <button className="submit-btn" type="submit">Guardar</button>
                <button className="cancel-btn" onClick={() => setMostrarModalRetorno(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {novedadSeleccionada && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Novedades</h3>
            <div className="bitacora-content">{novedadSeleccionada}</div>
            <div className="form-buttons">
              <button className="cancel-btn"
              onClick={() => {
                setNovedadSeleccionada(null);
                cargarMovimientos();
              }}
            >
              Cerrar
            </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovimientoMoviles;