import React, { useEffect, useState } from "react";
import api from "../api";
import "./Styles/MovimientosPersonas.css";
import { useUsuario } from "../context/UserContext";

function MovimientosPersonas() {
  const { usuario } = useUsuario();
  const [personal, setPersonal] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
  });
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroApellido, setFiltroApellido] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    nombre: "",
    apellido: "",
    tipo: "",
  });
  const [vistaActiva, setVistaActiva] = useState("registrar");
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPersonal = async () => {
    try {
      const response = await api.get(
        "/personal_nombres"
      );
      setPersonal(response.data);
    } catch (error) {
      console.error("Error al cargar personal:", error);
    }
  };

  const fetchMovimientos = async () => {
    try {
      const response = await api.get(
        "/movimientos_cuartel"
      );
      setMovimientos(response.data);
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
    }
  };

  useEffect(() => {
    fetchPersonal();
    fetchMovimientos();
    const interval = setInterval(fetchMovimientos, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    if (id === "") {
      setFormData({ nombre: "", apellido: "", dni: "" });
    } else {
      const persona = personal.find((p) => p.id.toString() === id);
      if (persona) {
        setFormData({
          nombre: persona.nombre,
          apellido: persona.apellido,
          dni: persona.id.toString(),
        });
      }
    }
  };

  const handleInputChange = (e) => {
    if (!selectedId) {
      const { name, value } = e.target;

      if (name === "nombre" || name === "apellido") {
        const letras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
        if (!letras.test(value)) return;
      }

      if (name === "dni") {
        const numeros = /^[0-9]*$/;
        if (!numeros.test(value)) return;
        if (value.length > 8) return;
      }

      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const registrarMovimiento = async (estado_id) => {
    try {
      if (!formData.nombre || !formData.apellido || !formData.dni) {
        alert(
          "Por favor complete todos los campos antes de registrar el movimiento."
        );
        return;
      }

      const personaKey =
        selectedId || `${formData.nombre}-${formData.apellido}-${formData.dni}`;
      const movimientosPersona = movimientos
        .filter((m) => {
          if (selectedId) return m.dni === personaKey;
          return (
            m.nombre === formData.nombre &&
            m.apellido === formData.apellido &&
            m.dni === formData.dni
          );
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const ultimo = movimientosPersona[0];
      if (
        ultimo &&
        ((estado_id === 1 && ultimo.estado === "Ingreso") ||
          (estado_id === 2 && ultimo.estado === "Egreso"))
      ) {
        const estadoTexto = estado_id === 1 ? "ingresada" : "egresada";
        alert(`La persona ya se encuentra ${estadoTexto}.`);
        return;
      }

      const payload = {
        id_personal: selectedId || null,
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        estado_id,
      };
      await api.post("/movimientos_cuartel", payload);
      fetchMovimientos();
      setSelectedId("");
      setFormData({ nombre: "", apellido: "", dni: "" });
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
    }
  };

  const eliminarMovimientoLocal = async (id) => {
    try {
      await api.put(
        `/movimientos_cuartel/${id}/ocultar`
      );
      fetchMovimientos();
    } catch (error) {
      console.error("Error al ocultar movimiento:", error);
    }
  };

  const aplicarFiltros = () => {
    setFiltrosAplicados({
      nombre: filtroNombre,
      apellido: filtroApellido,
      tipo: filtroTipo,
    });
    setFiltroNombre("");
    setFiltroApellido("");
    setFiltroTipo("");
    setCurrentPage(1);
  };

  const movimientosFiltrados = movimientos.filter(
    (m) =>
      m.nombre.toLowerCase().includes(filtrosAplicados.nombre.toLowerCase()) &&
      m.apellido
        .toLowerCase()
        .includes(filtrosAplicados.apellido.toLowerCase()) &&
      (filtrosAplicados.tipo ? m.estado === filtrosAplicados.tipo : true)
  );

  const totalPages = Math.ceil(movimientosFiltrados.length / ITEMS_PER_PAGE);
  const currentMovimientos = movimientosFiltrados.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="sidebar-layout">
      <aside className="sidebar">
        <button onClick={() => setVistaActiva("registrar")}>
          Registrar Movimiento
        </button>
        <button onClick={() => setVistaActiva("historial")}>
          Historial de Movimientos
        </button>
      </aside>
      <main className="contenido-principal">
        {vistaActiva === "registrar" && (
          <>
            <h2>Registrar Ingreso / Egreso</h2>
            <div className="movimientos-form">
              <select value={selectedId} onChange={handleSelectChange}>
                <option value="">Ingreso Manual</option>
                {personal.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre_completo}
                  </option>
                ))}
              </select>
              <br />
              <br />
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                disabled={!!selectedId}
              />
              <input
                type="text"
                name="apellido"
                placeholder="Apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                disabled={!!selectedId}
              />
              <input
                type="text"
                name="dni"
                placeholder="DNI"
                value={formData.dni}
                onChange={handleInputChange}
                disabled={!!selectedId}
              />
              <br />
              <br />
              <button
                className="btn ingreso"
                onClick={() => registrarMovimiento(1)}
              >
                Marcar Ingreso
              </button>
              <button
                className="btn egreso"
                onClick={() => registrarMovimiento(2)}
              >
                Marcar Egreso
              </button>
            </div>
          </>
        )}
        {vistaActiva === "historial" && (
          <>
            <h3 style={{ marginTop: "3rem" }}>Historial de Movimientos</h3>
            <div className="filter-container">
              <input
                className="filter-input"
                type="text"
                placeholder="Filtrar por nombre"
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
              />
              <input
                className="filter-input"
                type="text"
                placeholder="Filtrar por apellido"
                value={filtroApellido}
                onChange={(e) => setFiltroApellido(e.target.value)}
              />
              <select
                className="filter-select"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Ingreso">Ingreso</option>
                <option value="Egreso">Egreso</option>
              </select>
              <button className="filter-btn" onClick={aplicarFiltros}>
                Filtrar
              </button>
            </div>
            <table className="movimientos-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>DNI / Legajo</th>
                  <th>Tipo</th>
                  {["Administrador", "Jefatura"].includes(usuario?.rol) && <th>Acción</th>}
                </tr>
              </thead>
              <tbody>
                {currentMovimientos.length > 0 ? (
                  currentMovimientos.map((m) => (
                    <tr key={m.id}>
                      <td>
                        {new Date(m.timestamp).toLocaleDateString("es-AR")}
                      </td>
                      <td>
                        {new Date(m.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </td>
                      <td>{m.nombre}</td>
                      <td>{m.apellido}</td>
                      <td>{m.dni}</td>
                      <td>{m.estado}</td>
                      {["Administrador", "Jefatura"].includes(usuario?.rol) && (
                        <td>
                          <button
                            className="btn eliminar"
                            onClick={() => eliminarMovimientoLocal(m.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={["Administrador", "Jefatura"].includes(usuario?.rol) ? "7" : "6"}>
                      No hay movimientos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="pagination">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default MovimientosPersonas;
