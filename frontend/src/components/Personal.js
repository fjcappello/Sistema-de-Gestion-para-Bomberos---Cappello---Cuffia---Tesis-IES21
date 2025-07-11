import React, { useEffect, useState } from "react";
import api from "../api";
import "./Styles/PersonalTable.css";
import "./Styles/Tablas.css";
import { useUsuario } from "../context/UserContext";

const ITEMS_PER_PAGE = 5;

function PersonalTable() {
  const { usuario } = useUsuario();
  const [personal, setPersonal] = useState([]);
  const [jerarquias, setJerarquias] = useState([]);
  const [situaciones, setSituaciones] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    legajo: "",
    nombre: "",
    apellido: "",
    documento: "",
    nacimiento: "",
    fecha_ingreso: "",
    jerarquia_id: "",
    situacion_id: "",
    fecha_revision_medica: "",
    rol_id: "1",
  });
  const [deleteLegajo, setDeleteLegajo] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Estados para filtros temporales y aplicados
  const [filtrosTemp, setFiltrosTemp] = useState({
    legajo: "",
    nombreApellido: "",
    documento: "",
    ingresoDesde: "",
    ingresoHasta: "",
    jerarquia: "",
    situacion: "",
    vencida: false,
  });
  const [filtrosAplicados, setFiltrosAplicados] = useState({
    legajo: "",
    nombreApellido: "",
    documento: "",
    ingresoDesde: "",
    ingresoHasta: "",
    jerarquia: "",
    situacion: "",
    vencida: false,
  });

  const fetchPersonal = async () => {
    try {
      const response = await api.get("/personal");
      setPersonal(response.data);
    } catch (error) {
      console.error("Error al obtener datos de personal:", error);
    }
  };

  const fetchJerarquias = async () => {
    try {
      const response = await api.get("/jerarquias");
      setJerarquias(response.data);
    } catch (error) {
      console.error("Error al obtener jerarquías:", error);
    }
  };

  const fetchSituaciones = async () => {
    try {
      const response = await api.get("/situaciones");
      setSituaciones(response.data);
    } catch (error) {
      console.error("Error al obtener situaciones:", error);
    }
  };

  useEffect(() => {
    fetchPersonal();
    fetchJerarquias();
    fetchSituaciones();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Función para manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltrosTemp(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Función para aplicar los filtros
  const aplicarFiltros = () => {
    setFiltrosAplicados({ ...filtrosTemp });
    setCurrentPage(1); // Resetear a la primera página
  };

  // Función para limpiar los filtros
  const limpiarFiltros = () => {
    setFiltrosTemp({
      legajo: "",
      nombreApellido: "",
      documento: "",
      ingresoDesde: "",
      ingresoHasta: "",
      jerarquia: "",
      situacion: "",
      vencida: false,
    });
    setFiltrosAplicados({
      legajo: "",
      nombreApellido: "",
      documento: "",
      ingresoDesde: "",
      ingresoHasta: "",
      jerarquia: "",
      situacion: "",
      vencida: false,
    });
    setCurrentPage(1); // Resetear a la primera página
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    // ... (mantener el mismo código existente)
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    // ... (mantener el mismo código existente)
  };

  const handleDelete = async () => {
    // ... (mantener el mismo código existente)
  };

  const clearFormData = () => {
    // ... (mantener el mismo código existente)
  };

  const openAddModal = () => {
    // ... (mantener el mismo código existente)
  };

  const openEditModal = (rrhh) => {
    // ... (mantener el mismo código existente)
  };

  const isExpired = (date) => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return new Date(date) < oneYearAgo;
  };

  // Filtrado usando filtrosAplicados
  const personalFiltrado = personal.filter((p) => {
    const coincideLegajo =
      filtrosAplicados.legajo === "" || p.legajo.toString().includes(filtrosAplicados.legajo);
    const coincideNombreApellido =
      filtrosAplicados.nombreApellido === "" ||
      p.nombre_completo
        .toLowerCase()
        .includes(filtrosAplicados.nombreApellido.toLowerCase());
    const coincideDocumento =
      filtrosAplicados.documento === "" ||
      p.documento.toString().includes(filtrosAplicados.documento);
    const coincideIngresoDesde =
      filtrosAplicados.ingresoDesde === "" ||
      new Date(p.fecha_ingreso) >= new Date(filtrosAplicados.ingresoDesde);
    const coincideIngresoHasta =
      filtrosAplicados.ingresoHasta === "" ||
      new Date(p.fecha_ingreso) <= new Date(filtrosAplicados.ingresoHasta);
    const coincideJerarquia =
      filtrosAplicados.jerarquia === "" || p.jerarquia === filtrosAplicados.jerarquia;
    const coincideSituacion =
      filtrosAplicados.situacion === "" || p.situacion === filtrosAplicados.situacion;
    const coincideVencida =
      !filtrosAplicados.vencida || isExpired(p.fecha_revision_medica);
    return (
      coincideLegajo &&
      coincideNombreApellido &&
      coincideDocumento &&
      coincideIngresoDesde &&
      coincideIngresoHasta &&
      coincideJerarquia &&
      coincideSituacion &&
      coincideVencida
    );
  });

  const totalPagesFiltered = Math.ceil(
    personalFiltrado.length / ITEMS_PER_PAGE
  );
  const currentPersonal = personalFiltrado.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="table-container">
      <h2 className="table-title">Personal</h2>

      <div className="botonera_tablas">
        {["Administrador", "Jefatura"].includes(usuario?.rol) && (
        <>
          <button className="add-person-btn" onClick={openAddModal}>
            Agregar Nuevo Personal
          </button>
          {
          <button
            className="delete-person-btn"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Eliminar Personal
          </button>
          }
        </>
        )}
      </div>

      <div className="filtros">
        <input
          type="text"
          placeholder="Legajo"
          name="legajo"
          value={filtrosTemp.legajo}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          placeholder="Nombre o Apellido"
          name="nombreApellido"
          value={filtrosTemp.nombreApellido}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          placeholder="Documento"
          name="documento"
          value={filtrosTemp.documento}
          onChange={handleFilterChange}
        />
        <label>Desde Ingreso:</label>
        <input
          type="date"
          name="ingresoDesde"
          value={filtrosTemp.ingresoDesde}
          onChange={handleFilterChange}
        />
        <label>Hasta Ingreso:</label>
        <input
          type="date"
          name="ingresoHasta"
          value={filtrosTemp.ingresoHasta}
          onChange={handleFilterChange}
        />
        <select
          name="jerarquia"
          value={filtrosTemp.jerarquia}
          onChange={handleFilterChange}
        >
          <option value="">Todas las jerarquías</option>
          {jerarquias.map((j) => (
            <option key={j.id} value={j.jerarquia}>
              {j.jerarquia}
            </option>
          ))}
        </select>
        <select
          name="situacion"
          value={filtrosTemp.situacion}
          onChange={handleFilterChange}
        >
          <option value="">Todas las situaciones</option>
          {situaciones.map((s) => (
            <option key={s.id} value={s.nombre}>
              {s.nombre}
            </option>
          ))}
        </select>
        <label>
          Mostrar solo vencidas
          <input
            type="checkbox"
            name="vencida"
            checked={filtrosTemp.vencida}
            onChange={handleFilterChange}
          />
        </label>
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
            <th>Legajo</th>
            <th>Nombre y Apellido</th>
            <th>Documento</th>
            <th>Fecha de nacimiento</th>
            <th>Fecha de ingreso</th>
            <th>Jerarquía</th>
            <th>Situación</th>
            <th>Fecha Revisión Médica</th>
            {["Administrador", "Jefatura"].includes(usuario?.rol) && <th>Acciones</th>}
          </tr>
        </thead>  
        <tbody>
          {currentPersonal.length > 0 ? (
            currentPersonal.map((rrhh) => (
              <tr
                key={rrhh.legajo}
                className={isExpired(rrhh.fecha_revision_medica) ? "vencida" : ""}
                title={isExpired(rrhh.fecha_revision_medica) ? "Ficha médica vencida" : ""}
              >
                <td>{rrhh.legajo}</td>
                <td>{rrhh.nombre_completo}</td>
                <td>{rrhh.documento}</td>
                <td>{rrhh.nacimiento}</td>
                <td>{rrhh.fecha_ingreso}</td>
                <td>{rrhh.jerarquia}</td>
                <td>{rrhh.situacion}</td>
                <td>
                  {rrhh.fecha_revision_medica
                    ? new Date(rrhh.fecha_revision_medica).toLocaleDateString(
                        "es-AR"
                      )
                    : ""}
                  {isExpired(rrhh.fecha_revision_medica) && (
                    <span
                      title="Ficha médica vencida"
                      style={{ marginLeft: "4px", color: "white" }}
                    >
                      ⚠️ Ficha Medica Vencida
                    </span>
                  )}
                </td>
            {["Administrador", "Jefatura"].includes(usuario?.rol) && (
              <td>
                <button
                  className="edit-btn"
                  title="Editar esta persona"
                  onClick={() => openEditModal(rrhh)}
                >
                  Editar
                </button>
              </td>
            )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={["Administrador", "Jefatura"].includes(usuario?.rol) ? "9" : "8"}>
                No hay datos de personal disponibles
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
          Página {currentPage} de {totalPagesFiltered}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPagesFiltered}
        >
          Siguiente
        </button>
      </div>

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Agregar Nuevo Personal</h3>
            <form onSubmit={handleAddSubmit} className="form-container">
              <input
                type="number"
                className="filtro-input"
                name="legajo"
                placeholder="Legajo"
                value={formData.legajo}
                onChange={handleInputChange}
                required
                min="1"
              />
              <input
                type="text"
                className="filtro-input"
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                className="filtro-input"
                name="apellido"
                placeholder="Apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                className="filtro-input"
                name="documento"
                placeholder="Documento"
                value={formData.documento}
                onChange={handleInputChange}
                required
                min="1"
                max="99999999"
              />
              <label>Fecha de Nacimiento:</label>
              <input
                type="date"
                className="filtro-input"
                name="nacimiento"
                value={formData.nacimiento}
                onChange={handleInputChange}
                required
              />
              <label>Fecha de Ingreso:</label>
              <input
                type="date"
                className="filtro-input"
                name="fecha_ingreso"
                value={formData.fecha_ingreso}
                onChange={handleInputChange}
                required
              />
              <label>Jerarquía:</label>
              <select
                className="filtro-select"
                name="jerarquia_id"
                value={formData.jerarquia_id}
                onChange={handleInputChange}
              >
                <option value="">Seleccione Jerarquía</option>
                {jerarquias.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.jerarquia}
                  </option>
                ))}
              </select>
              <label>Fecha Revisión Médica:</label>
              <input
                type="date"
                className="filtro-input"
                name="fecha_revision_medica"
                value={formData.fecha_revision_medica}
                onChange={handleInputChange}
                required
                max={new Date().toISOString().split("T")[0]}
              />
              <button type="submit" className="submit-btn">
                Agregar Personal
              </button>
            </form>
            <button
              className="close-modal-btn"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Personal</h3>
            <form onSubmit={handleEditSubmit} className="form-container">
              <label>Jerarquía:</label>
              <select
                className="filtro-select"
                name="jerarquia_id"
                value={formData.jerarquia_id}
                onChange={handleInputChange}
              >
                <option value="">Seleccione Jerarquía</option>
                {jerarquias.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.jerarquia}
                  </option>
                ))}
              </select>
              <label>Situación:</label>
              <select
                className="filtro-select"
                name="situacion_id"
                value={formData.situacion_id}
                onChange={handleInputChange}
              >
                <option value="">Seleccione Situación</option>
                {situaciones.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
              <label>Fecha Revisión Médica:</label>
              <input
                type="date"
                className="filtro-input"
                name="fecha_revision_medica"
                value={formData.fecha_revision_medica}
                onChange={handleInputChange}
                max={new Date().toISOString().split("T")[0]}
              />
              <button type="submit" className="submit-btn">
                Guardar Cambios
              </button>
            </form>
            <button
              className="close-modal-btn"
              onClick={() => {
                clearFormData();
                setIsEditModalOpen(false);
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Eliminar Personal</h3>
            <input
              type="text"
              className="filtro-input"
              placeholder="Ingrese el legajo"
              value={deleteLegajo}
              onChange={(e) => {
                setDeleteLegajo(e.target.value);
                setDeleteError("");
              }}
              required
            />
            <button
              className="confirm-delete-btn"
              onClick={() => setConfirmDelete(true)}
            >
              Eliminar
            </button>
            <button
              className="close-modal-btn"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </button>
          </div>

          {confirmDelete && (
            <div className="confirm-overlay">
              <div className="confirm-content">
                <p>¿Está seguro? Esta acción no se puede deshacer.</p>
                {deleteError && <p className="error-message">{deleteError}</p>}
                <button className="confirm-delete-btn" onClick={handleDelete}>
                  Confirmar
                </button>
                <button
                  className="close-modal-btn"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PersonalTable;
