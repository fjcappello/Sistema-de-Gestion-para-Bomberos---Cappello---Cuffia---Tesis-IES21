import React, { useEffect, useState } from "react";
import api from "../api";
import "./Styles/MovilesRegistro.css";
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
      const movilesConEstado = response.data.data.map((movil) => ({
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
      setEstados(response.data.data);
    } catch (error) {
      console.error("Error al obtener estados:", error);
    }
  };

  useEffect(() => {
    fetchMoviles();
    fetchEstados();
  }, []);

  const handleChangeFormData = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(
        "/moviles_agregar",
        formData
      );
      if (response.data.success) {
        alert(response.data.message || "Móvil agregado correctamente");
        setIsAddModalOpen(false);
        fetchMoviles();
      } else {
        alert(response.data.message || "Error al agregar móvil");
      }
    } catch (error) {
      console.error("Error al agregar móvil:", error);
      alert("Error al agregar móvil");
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      interno: "",
      marca: "",
      dominio: "",
      estado_id: "",
      vencido: "",
    });
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

  const filterMoviles = () => {
    return moviles.filter(
      (movil) =>
        movil.interno.toLowerCase().includes(filtros.interno.toLowerCase()) &&
        movil.marca.toLowerCase().includes(filtros.marca.toLowerCase()) &&
        movil.dominio.toLowerCase().includes(filtros.dominio.toLowerCase()) &&
        (filtros.estado_id
          ? movil.estado_id.toString() === filtros.estado_id
          : true) &&
        (filtros.vencido === "Sí"
          ? isServiceVencido(movil.fecha_service)
          : filtros.vencido === "No"
          ? !isServiceVencido(movil.fecha_service)
          : true)
    );
  };

  const filteredMoviles = filterMoviles();

  const totalPages = Math.ceil(filteredMoviles.length / itemsPorPagina);
  const paginatedMoviles = filteredMoviles.slice(
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
      const response = await api.put(
        `/moviles_editar/${editData.id}`,
        cambios
      );
      if (response.data.success) {
        alert(response.data.message || "Móvil editado correctamente");
        setEditData(null);
        fetchMoviles();
      } else {
        alert(response.data.message || "Error al editar móvil");
      }
    } catch (error) {
      console.error("Error al editar móvil:", error);
      alert("Error al editar móvil");
    }
  };

  return (
    <div className="moviles-registro-container">
      <h2 className="moviles-registro-titulo">Registro de Móviles</h2>

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
        {["Administrador", "Jefatura"].includes(usuario?.rol) && (
          <button onClick={() => setIsAddModalOpen(true)}>Agregar Móvil</button>
        )}
        <button onClick={handleLimpiarFiltros}>Limpiar Filtros</button>
      </div>

      <table className="moviles-registro-tabla">
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
              style={
                isServiceVencido(movil.fecha_service)
                  ? { backgroundColor: "red" }
                  : {}
              }
            >
              <td>{movil.interno}</td>
              <td>{movil.marca}</td>
              <td>{movil.modelo}</td>
              <td>{movil.dominio}</td>
              <td>{movil.vin}</td>
              <td>{movil.kilometraje_actual}</td>
              <td>{formatFecha(movil.fecha_service)}</td>
              <td>
                {(() => {
                  const estado = estados.find(
                    (e) => e.id === parseInt(movil.estado_id)
                  );
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
                      movil.estado_id === 3
                        ? "editar-deshabilitado"
                        : "agregar-movil-button"
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

      <div className="paginacion">
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
          <div className="modal">
            <form
              className="moviles-registro-editar-form"
              onSubmit={handleEditSubmit}
            >
              <label>Kilometraje Actual:</label>
              <input
                type="number"
                name="kilometraje_actual"
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
                min={today}
              />
              <label>Estado:</label>
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
              <button type="submit">Guardar</button>
              <button type="button" onClick={() => setEditData(null)}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Agregar Móvil</h2>
            <form
              className="moviles-registro-agregar-form"
              onSubmit={handleSubmit}
            >
              <label>Interno:</label>
              <input
                type="text"
                name="interno"
                value={formData.interno}
                onChange={handleChangeFormData}
                required
              />
              <label>Marca:</label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChangeFormData}
                required
              />
              <label>Modelo:</label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChangeFormData}
                required
              />
              <label>Dominio:</label>
              <input
                type="text"
                name="dominio"
                value={formData.dominio}
                onChange={handleChangeFormData}
                required
              />
              <label>VIN:</label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleChangeFormData}
                required
              />
              <label>Kilometraje:</label>
              <input
                type="number"
                name="kilometraje_inicial"
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
                min={today}
                required
              />
              <label>Estado:</label>
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
              <div className="form-buttons-agregar">
                <button type="submit">Guardar</button>
                <button type="button" onClick={() => setIsAddModalOpen(false)}>
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
