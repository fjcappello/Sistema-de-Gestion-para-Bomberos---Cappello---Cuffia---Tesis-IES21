import React, { useEffect, useState } from "react";
import api from "../api";
import "./Styles/MovilesRegistro.css";
import "./Styles/Tablas.css";
import { useUsuario } from "../context/UserContext";

function MovilesRegistro() {
  const { usuario } = useUsuario();
  const [moviles, setMoviles] = useState([]);
  const [filtros, setFiltros] = useState({
    interno: "",
    marca: "",
    dominio: "",
    estado_id: "",
    vencido: "",
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    interno: "",
    marca: "",
    dominio: "",
    estado_id: "",
    vencido: "",
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(5);
  const [formData, setFormData] = useState({
    interno: "",
    marca: "",
    modelo: "",
    dominio: "",
    vin: "",
    kilometraje_inicial: "",
    fecha_service: "",
    estado_id: 1,
  });

  const [estados, setEstados] = useState([]);
  const [editData, setEditData] = useState(null);
  const [editFormData, setEditFormData] = useState({
    kilometraje_actual: "",
    fecha_service: "",
    estado_id: "",
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  const fetchMoviles = async () => {
    try {
      const response = await api.get("/moviles");
      const movilesConEstado = response.data.map((movil) => ({
        ...movil,
        estado_id: parseInt(movil.estado_id),
      }));
      setMoviles(movilesConEstado);
    } catch (error) {
      console.error("Error al obtener móviles:", error);
    }
  };

  const fetchEstados = async () => {
    try {
      const response = await api.get("/estados_moviles");
      setEstados(response.data);
    } catch (error) {
      console.error("Error al obtener estados:", error);
    }
  };

  useEffect(() => {
    fetchMoviles();
    fetchEstados();
  }, []);

  const camposNumericos = ["kilometraje_inicial", "estado_id"];

  const handleChangeFormData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: camposNumericos.includes(name)
        ? value === "" ? "" : Number(value)
        : value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        legajo: usuario?.legajo
      };
      await api.post("/moviles_agregar", data);
      alert("Móvil agregado correctamente");
      setIsAddModalOpen(false);
      fetchMoviles();
    } catch (error) {
      console.error("Error al agregar móvil:", error);
      alert("Error al agregar móvil");
    }
  };

  const handleLimpiarFiltros = () => {
    const filtroInicial = {
      interno: "",
      marca: "",
      dominio: "",
      estado_id: "",
      vencido: "",
    };
    setFiltros(filtroInicial);
    setFiltrosAplicados(filtroInicial);
    setPaginaActual(1);
  };

  const handleAplicarFiltros = () => {
    setFiltrosAplicados({ ...filtros });
    setPaginaActual(1);
  };

  const handleChangeFiltros = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return `${date.getDate().toString().padStart(2, "0")}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${date.getFullYear()}`;
  };

  const isServiceVencido = (fecha) => {
    const date = new Date(fecha);
    const now = new Date();
    return now - date > 365 * 24 * 60 * 60 * 1000;
  };

  const movilesFiltrados = moviles.filter(
    (movil) =>
      movil.interno.toLowerCase().includes(filtrosAplicados.interno.toLowerCase()) &&
      movil.marca.toLowerCase().includes(filtrosAplicados.marca.toLowerCase()) &&
      movil.dominio.toLowerCase().includes(filtrosAplicados.dominio.toLowerCase()) &&
      (filtrosAplicados.estado_id
        ? movil.estado_id.toString() === filtrosAplicados.estado_id
        : true) &&
      (filtrosAplicados.vencido === "Sí"
        ? isServiceVencido(movil.fecha_service)
        : filtrosAplicados.vencido === "No"
        ? !isServiceVencido(movil.fecha_service)
        : true)
  );

  const totalPages = Math.ceil(movilesFiltrados.length / itemsPorPagina);
  const paginatedMoviles = movilesFiltrados.slice(
    (paginaActual - 1) * itemsPorPagina,
    paginaActual * itemsPorPagina
  );

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    const cambios = {};
    if (editFormData.kilometraje_actual !== editData.kilometraje_actual) {
      cambios.kilometraje_actual = editFormData.kilometraje_actual;
    }
    if (editFormData.fecha_service !== editData.fecha_service) {
      cambios.fecha_service = editFormData.fecha_service;
    }
    if (editFormData.estado_id !== editData.estado_id) {
      cambios.estado_id = editFormData.estado_id;
    }

    if (Object.keys(cambios).length === 0) {
      alert("No se realizaron cambios.");
      return;
    }

    try {
      const data = {
        ...cambios,
        id: editData.id,
        legajo: usuario?.legajo
      }
      await api.put(`/moviles_editar`, data);
      alert("Móvil editado correctamente");
      setEditData(null);
      fetchMoviles();
    } catch (error) {
      console.error("Error al editar móvil:", error);
      alert("Error al editar móvil");
    }
  };

  return (
    <div className="table-container">
      <h2 className="table-title">Registro de Móviles</h2>

      <div className="botonera_tablas">
        {["Administrador", "Jefatura"].includes(usuario?.rol) && (
          <button className="add-report-btn" onClick={() => setIsAddModalOpen(true)}>Agregar Móvil</button>
        )}
      </div>

      <div className="filtros">
        <input
          type="text"
          name="interno"
          placeholder="Filtrar por Interno"
          value={filtros.interno}
          onChange={handleChangeFiltros}
        />
        <input
          type="text"
          name="marca"
          placeholder="Filtrar por Marca"
          value={filtros.marca}
          onChange={handleChangeFiltros}
        />
        <input
          type="text"
          name="dominio"
          placeholder="Filtrar por Dominio"
          value={filtros.dominio}
          onChange={handleChangeFiltros}
        />
        <select
          name="estado_id"
          value={filtros.estado_id}
          onChange={handleChangeFiltros}
        >
          <option value="">Filtrar por Estado</option>
          {estados.map((estado) => (
            <option key={estado.id} value={estado.id}>
              {estado.nombre}
            </option>
          ))}
        </select>
        <select
          name="vencido"
          value={filtros.vencido}
          onChange={handleChangeFiltros}
        >
          <option value="">Filtrar por Vencido</option>
          <option value="Sí">Sí</option>
          <option value="No">No</option>
        </select>
        <button onClick={handleAplicarFiltros}>Aplicar Filtros</button>
        <button onClick={handleLimpiarFiltros}>Limpiar Filtros</button>
      </div>

      <table className="table-fluent">
        <thead>
          <tr>
            <th>Interno</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Dominio</th>
            <th>VIN</th>
            <th>Kilometraje</th>
            <th>Fecha de Service</th>
            <th>Estado</th>
            {["Administrador", "Jefatura"].includes(usuario?.rol) && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {paginatedMoviles.map((movil) => (
            <tr
              key={movil.id}
              className={isServiceVencido(movil.fecha_service) ? "vencida" : ""}
              title={isServiceVencido(movil.fecha_service) ? "Service vencido" : ""}
            >
              <td>{movil.interno}</td>
              <td>{movil.marca}</td>
              <td>{movil.modelo}</td>
              <td>{movil.dominio}</td>
              <td>{movil.vin}</td>
              <td>{movil.kilometraje_actual}</td>
              <td>
                {isServiceVencido(movil.fecha_service) ? (
                  <>
                    {formatFecha(movil.fecha_service)} ⚠️ Realizar Service
                  </>
                ) : (
                  formatFecha(movil.fecha_service)
                )}
              </td>
              <td>
                {(() => {
                  const estado = estados.find((e) => e.id === parseInt(movil.estado_id));
                  return estado ? estado.nombre : `ID: ${movil.estado_id}`;
                })()}
              </td>
              {["Administrador", "Jefatura"].includes(usuario?.rol) && (
                <td>
                  <button
                    onClick={() => {
                      setEditData(movil);
                      setEditFormData({
                        kilometraje_actual: movil.kilometraje_actual,
                        fecha_service: movil.fecha_service,
                        estado_id: movil.estado_id,
                      });
                    }}
                    className={
                      movil.estado_id === 3 ? "editar-deshabilitado" : "edit-btn"
                    }
                    disabled={movil.estado_id === 3}
                    title={
                      movil.estado_id === 3
                        ? "Este móvil está dado de baja y no se puede editar."
                        : ""
                    }
                  >
                    Editar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button
          onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
          disabled={paginaActual === 1}
        >
          Anterior
        </button>
        <span>
          Página {paginaActual} de {totalPages}
        </span>
        <button
          onClick={() =>
            setPaginaActual((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={paginaActual === totalPages}
        >
          Siguiente
        </button>
      </div>

      {editData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar móvil</h3>
            <form className="form-container" onSubmit={handleEditSubmit}>
              <label>Kilometraje Inicial:</label>
              <input
                type="number"
                name="kilometraje_actual"
                min={0}
                value={editFormData.kilometraje_actual}
                onChange={handleEditChange}
                placeholder="Kilometraje Actual"
              />
              <label>Fecha de Service:</label>
              <input
                type="date"
                name="fecha_service"
                value={editFormData.fecha_service}
                onChange={handleEditChange}
              />
              <select
                name="estado_id"
                value={editFormData.estado_id || ""}
                onChange={handleEditChange}
              >
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
              <div className="form-buttons">
                <button className="submit-btn" type="submit">Guardar</button>
                <button className="cancel-btn" type="button" onClick={() => setEditData(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Agregar Móvil</h3>
            <form className="form-container" onSubmit={handleSubmit}>
              <input
                type="text"
                name="interno"
                placeholder="Codigo interno"
                value={formData.interno}
                onChange={handleChangeFormData}
                required
              />
              <input
                type="text"
                name="marca"
                placeholder="Marca"
                value={formData.marca}
                onChange={handleChangeFormData}
                required
              />
              <input
                type="text"
                name="modelo"
                placeholder="Modelo"
                value={formData.modelo}
                onChange={handleChangeFormData}
                required
              />
              <input
                type="text"
                name="dominio"
                placeholder="Dominio"
                value={formData.dominio}
                onChange={handleChangeFormData}
                required
              />
              <input
                type="text"
                name="vin"
                placeholder="VIN"
                value={formData.vin}
                onChange={handleChangeFormData}
                required
              />
              <input
                type="number"
                name="kilometraje_inicial"
                placeholder="Kilometraje Inicial"
                min={0}
                value={formData.kilometraje_inicial}
                onChange={handleChangeFormData}
                required
              />
              <label>Fecha de Service:</label>
              <input
                type="date"
                name="fecha_service"
                value={formData.fecha_service}
                onChange={handleChangeFormData}
                required
              />
              <select
                name="estado_id"
                value={formData.estado_id}
                onChange={handleChangeFormData}
                required
              >
                <option value="">Seleccione un estado</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
              <div className="form-buttons">
                <button className="submit-btn" type="submit">Guardar</button>
                <button className="cancel-btn" type="button" onClick={() => setIsAddModalOpen(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovilesRegistro;
