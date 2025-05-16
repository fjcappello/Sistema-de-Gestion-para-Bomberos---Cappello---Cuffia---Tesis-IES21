import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Styles/PersonalTable.css";
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
  });
  const [deleteLegajo, setDeleteLegajo] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [filtros, setFiltros] = useState({
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
      const response = await axios.get("http://localhost:3001/personal");
      setPersonal(response.data);
    } catch (error) {
      console.error("Error al obtener datos de personal:", error);
    }
  };

  const fetchJerarquias = async () => {
    try {
      const response = await axios.get("http://localhost:3001/jerarquias");
      setJerarquias(response.data);
    } catch (error) {
      console.error("Error al obtener jerarquías:", error);
    }
  };

  const fetchSituaciones = async () => {
    try {
      const response = await axios.get("http://localhost:3001/situaciones");
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

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    const legajoVal = parseInt(formData.legajo, 10);
    if (isNaN(legajoVal) || legajoVal <= 0) {
      alert("El legajo debe ser un número positivo mayor a 0.");
      return;
    }

    const documentoVal = parseInt(formData.documento, 10);
    if (isNaN(documentoVal) || documentoVal < 1 || documentoVal > 99999999) {
      alert("El documento debe ser un número entre 1 y 99,999,999.");
      return;
    }

    formData.situacion_id = 1; // Establecer valor fijo de 'Activo'

    try {
      const response = await axios.post(
        "http://localhost:3001/personal",
        formData
      );
      if (response.data.success) {
        alert("Personal agregado correctamente");
        setIsAddModalOpen(false);
        clearFormData();
        fetchPersonal();
      } else {
        alert(
          "Error al agregar personal: " +
            (response.data.error || "Operación fallida")
        );
      }
    } catch (error) {
      console.error("Error al intentar agregar personal:", error);
      alert(
        "Error en el servidor al intentar agregar personal. Verifique la conexión."
      );
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const dataToUpdate = {};
    const original = personal.find((p) => p.legajo === formData.legajo);
    if (!original) return;

    if (
      formData.jerarquia_id &&
      formData.jerarquia_id !== original.jerarquia_id
    )
      dataToUpdate.jerarquia_id = formData.jerarquia_id;
    if (
      formData.situacion_id &&
      formData.situacion_id !== original.situacion_id
    )
      dataToUpdate.situacion_id = formData.situacion_id;
    if (
      formData.fecha_revision_medica &&
      formData.fecha_revision_medica !==
        original.fecha_revision_medica?.split("T")[0]
    )
      dataToUpdate.fecha_revision_medica = formData.fecha_revision_medica;

    if (Object.keys(dataToUpdate).length === 0) {
      alert("Debe modificar al menos un campo para guardar los cambios.");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:3001/personal/${formData.legajo}`,
        dataToUpdate
      );

      if (response.data.success) {
        alert("Datos actualizados correctamente");
        setIsEditModalOpen(false);
        fetchPersonal();
      } else {
        alert(
          "Error al actualizar: " + (response.data.error || "Operación fallida")
        );
      }
    } catch (error) {
      console.error("Error al intentar actualizar:", error);
      alert("Error en el servidor al intentar actualizar datos.");
    }
  };

  const handleDelete = async () => {
    if (!deleteLegajo) {
      setDeleteError("Por favor, ingrese un número de legajo válido.");
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:3001/personal/${deleteLegajo}`
      );
      if (response.data.success) {
        alert("Personal eliminado correctamente");
        setIsDeleteModalOpen(false);
        setDeleteLegajo("");
        setDeleteError("");
        fetchPersonal();
      } else {
        setDeleteError(
          "Error al eliminar personal: " +
            (response.data.error || "Operación fallida")
        );
      }
    } catch (error) {
      console.error("Error al intentar eliminar personal:", error);
      setDeleteError(
        "Error en el servidor al intentar eliminar personal. Verifique la conexión."
      );
    }
  };

  const clearFormData = () => {
    setFormData({
      legajo: "",
      nombre: "",
      apellido: "",
      documento: "",
      nacimiento: "",
      fecha_ingreso: "",
      jerarquia_id: "",
      situacion_id: "",
      fecha_revision_medica: "",
    });
  };

  const openAddModal = () => {
    clearFormData();
    setIsAddModalOpen(true);
  };

  const openEditModal = (rrhh) => {
    setFormData({
      legajo: rrhh.legajo,
      jerarquia_id: rrhh.jerarquia_id,
      situacion_id: rrhh.situacion_id,
      fecha_revision_medica: rrhh.fecha_revision_medica?.split("T")[0] || "",
    });
    setIsEditModalOpen(true);
  };

  const totalPages = Math.ceil(personal.length / ITEMS_PER_PAGE);

  const isExpired = (date) => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return new Date(date) < oneYearAgo;
  };

  const personalFiltrado = personal.filter((p) => {
    const coincideLegajo =
      filtros.legajo === "" || p.legajo.toString().includes(filtros.legajo);
    const coincideNombreApellido =
      filtros.nombreApellido === "" ||
      p.nombre_completo
        .toLowerCase()
        .includes(filtros.nombreApellido.toLowerCase());
    const coincideDocumento =
      filtros.documento === "" ||
      p.documento.toString().includes(filtros.documento);
    const coincideIngresoDesde =
      filtros.ingresoDesde === "" ||
      new Date(p.fecha_ingreso) >= new Date(filtros.ingresoDesde);
    const coincideIngresoHasta =
      filtros.ingresoHasta === "" ||
      new Date(p.fecha_ingreso) <= new Date(filtros.ingresoHasta);
    const coincideJerarquia =
      filtros.jerarquia === "" || p.jerarquia === filtros.jerarquia;
    const coincideSituacion =
      filtros.situacion === "" || p.situacion === filtros.situacion;
    const coincideVencida =
      !filtros.vencida || isExpired(p.fecha_revision_medica);
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
      <div className="filtros-container">
        <input
          type="text"
          className="filtro-input"
          placeholder="Legajo"
          onChange={(e) =>
            setFiltros((prev) => ({ ...prev, legajo: e.target.value }))
          }
        />
        <input
          type="text"
          className="filtro-input"
          placeholder="Nombre o Apellido"
          onChange={(e) =>
            setFiltros((prev) => ({ ...prev, nombreApellido: e.target.value }))
          }
        />
        <input
          type="text"
          className="filtro-input"
          placeholder="Documento"
          onChange={(e) =>
            setFiltros((prev) => ({ ...prev, documento: e.target.value }))
          }
        />
        <label>Desde Ingreso:</label>
        <input
          type="date"
          className="filtro-input"
          onChange={(e) =>
            setFiltros((prev) => ({ ...prev, ingresoDesde: e.target.value }))
          }
        />
        <label>Hasta Ingreso:</label>
        <input
          type="date"
          className="filtro-input"
          onChange={(e) =>
            setFiltros((prev) => ({ ...prev, ingresoHasta: e.target.value }))
          }
        />
        <select
          className="filtro-select"
          onChange={(e) =>
            setFiltros((prev) => ({ ...prev, jerarquia: e.target.value }))
          }
        >
          <option value="">Todas las jerarquías</option>
          {jerarquias.map((j) => (
            <option key={j.id} value={j.jerarquia}>
              {j.jerarquia}
            </option>
          ))}
        </select>
        <select
          className="filtro-select"
          onChange={(e) =>
            setFiltros((prev) => ({ ...prev, situacion: e.target.value }))
          }
        >
          <option value="">Todas las situaciones</option>
          {situaciones.map((s) => (
            <option key={s.id} value={s.nombre}>
              {s.nombre}
            </option>
          ))}
        </select>
        <label>
          <input
            type="checkbox"
            className="filtro-checkbox"
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, vencida: e.target.checked }))
            }
          />
          Solo vencidas
        </label>
      </div>
      <table className="personal-table">
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
                style={{
                  backgroundColor: isExpired(rrhh.fecha_revision_medica)
                    ? "red"
                    : "white",
                  color: isExpired(rrhh.fecha_revision_medica)
                    ? "white"
                    : "black",
                }}
                title={
                  isExpired(rrhh.fecha_revision_medica)
                    ? "Ficha médica vencida"
                    : ""
                }
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

      {["Administrador", "Jefatura"].includes(usuario?.rol) && (
        <>
          <button className="add-person-btn" onClick={openAddModal}>
            Agregar Nuevo Personal
          </button>
          <button
            className="delete-person-btn"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Eliminar Personal
          </button>
        </>
      )}

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
