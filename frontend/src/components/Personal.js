import React, { useEffect, useState, useMemo } from "react";
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
  const [modalUserMessage, setModalUserMessage] = useState(null);

  const fetchPersonal = async () => {
    try {
      const response = await axios.get("http://localhost:3001/personal");
      if (response.data && response.data.status === "success") {
        setPersonal(response.data.data);
      } else {
        const errorMessage = response.data && response.data.error ? response.data.error.message : "Error desconocido al obtener personal";
        console.error("Error al obtener datos de personal:", errorMessage);
        alert("Error al obtener datos de personal: " + errorMessage);
      }
    } catch (error) {
      console.error("Error de red al obtener datos de personal:", error);
      alert("Error de red al obtener datos de personal. Verifique la conexión.");
    }
  };

  const fetchJerarquias = async () => {
    try {
      const response = await axios.get("http://localhost:3001/jerarquias");
      if (response.data && response.data.status === "success") {
        setJerarquias(response.data.data);
      } else {
        const errorMessage = response.data && response.data.error ? response.data.error.message : "Error desconocido al obtener jerarquías";
        console.error("Error al obtener jerarquías:", errorMessage);
        alert("Error al obtener jerarquías: " + errorMessage);
      }
    } catch (error) {
      console.error("Error de red al obtener jerarquías:", error);
      alert("Error de red al obtener jerarquías. Verifique la conexión.");
    }
  };

  const fetchSituaciones = async () => {
    try {
      const response = await axios.get("http://localhost:3001/situaciones");
      if (response.data && response.data.status === "success") {
        setSituaciones(response.data.data);
      } else {
        const errorMessage = response.data && response.data.error ? response.data.error.message : "Error desconocido al obtener situaciones";
        console.error("Error al obtener situaciones:", errorMessage);
        alert("Error al obtener situaciones: " + errorMessage);
      }
    } catch (error) {
      console.error("Error de red al obtener situaciones:", error);
      alert("Error de red al obtener situaciones. Verifique la conexión.");
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
      setModalUserMessage({ type: 'error', text: "El legajo debe ser un número positivo mayor a 0." });
      return;
    }

    const documentoVal = parseInt(formData.documento, 10);
    if (isNaN(documentoVal) || documentoVal < 1 || documentoVal > 99999999) {
      setModalUserMessage({ type: 'error', text: "El documento debe ser un número entre 1 y 99,999,999." });
      return;
    }

    // Find 'Activo' situation ID dynamically
    const situacionActivo = situaciones.find(s => s.nombre && s.nombre.toLowerCase() === 'activo');

    if (!situacionActivo) {
      setModalUserMessage({ type: 'error', text: "Error: Situación 'Activo' no encontrada. No se puede agregar personal." });
      return;
    }
    formData.situacion_id = situacionActivo.id;
    setModalUserMessage(null); // Clear previous messages before API call

    try {
      const response = await axios.post(
        "http://localhost:3001/personal",
        formData
      );
      if (response.data && response.data.status === "success") {
        setModalUserMessage({ type: 'success', text: response.data.message || "Personal agregado correctamente" });
        setTimeout(() => {
          setIsAddModalOpen(false);
          clearFormData();
          fetchPersonal();
          setModalUserMessage(null);
        }, 2000); // Close modal after 2 seconds
      } else {
        let errorMessageText = "Error al agregar personal.";
        if (response.data && response.data.error) {
          errorMessageText = response.data.error.message;
          if (response.data.details && response.data.details.length > 0) {
            errorMessageText += "\nDetalles:\n" + response.data.details.join("\n");
          }
        }
        setModalUserMessage({ type: 'error', text: errorMessageText });
      }
    } catch (error) {
      console.error("Error al intentar agregar personal:", error.response ? error.response.data : error);
      let errorMessageText = "Error en el servidor al intentar agregar personal.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessageText = error.response.data.error.message;
        if (error.response.data.details && error.response.data.details.length > 0) {
          errorMessageText += "\nDetalles:\n" + error.response.data.details.join("\n");
        }
      }
      setModalUserMessage({ type: 'error', text: errorMessageText });
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
      setModalUserMessage({ type: 'error', text: "Debe modificar al menos un campo para guardar los cambios." });
      return;
    }
    setModalUserMessage(null); // Clear previous messages

    try {
      const response = await axios.put(
        `http://localhost:3001/personal/${formData.legajo}`,
        dataToUpdate
      );

      if (response.data && response.data.status === "success") {
        setModalUserMessage({ type: 'success', text: response.data.message || "Datos actualizados correctamente" });
        setTimeout(() => {
          setIsEditModalOpen(false);
          fetchPersonal();
          setModalUserMessage(null);
        }, 2000);
      } else {
        let errorMessageText = "Error al actualizar.";
        if (response.data && response.data.error) {
          errorMessageText = response.data.error.message;
          if (response.data.details && response.data.details.length > 0) {
            errorMessageText += "\nDetalles:\n" + response.data.details.join("\n");
          }
        }
        setModalUserMessage({ type: 'error', text: errorMessageText });
      }
    } catch (error) {
      console.error("Error al intentar actualizar:", error.response ? error.response.data : error);
      let errorMessageText = "Error en el servidor al intentar actualizar datos.";
      if (error.response && error.response.data && error.response.data.error) {
        errorMessageText = error.response.data.error.message;
        if (error.response.data.details && error.response.data.details.length > 0) {
          errorMessageText += "\nDetalles:\n" + error.response.data.details.join("\n");
        }
      }
      setModalUserMessage({ type: 'error', text: errorMessageText });
    }
  };

  const handleDelete = async () => {
    if (!deleteLegajo) {
      setModalUserMessage({ type: 'error', text: "Por favor, ingrese un número de legajo válido." });
      // Note: This message will appear in the main delete modal, not the confirm dialog, if not handled carefully.
      // For now, we'll set it and it will be visible when the confirm dialog closes or if the input is in the main modal.
      // If deleteLegajo input is only in main modal, this is fine.
      return;
    }
    setModalUserMessage(null); // Clear previous messages

    try {
      const response = await axios.delete(
        `http://localhost:3001/personal/${deleteLegajo}`
      );
      if (response.data && response.data.status === "success") {
        setModalUserMessage({ type: 'success', text: response.data.message || "Personal eliminado correctamente" });
        setTimeout(() => {
          setIsDeleteModalOpen(false);
          setDeleteLegajo("");
          setConfirmDelete(false); 
          fetchPersonal();
          setModalUserMessage(null);
        }, 2000);
      } else {
        const errorMessageText = (response.data && response.data.error && response.data.error.message) || "Error al eliminar personal.";
        setModalUserMessage({ type: 'error', text: errorMessageText });
      }
    } catch (error) {
      console.error("Error al intentar eliminar personal:", error.response ? error.response.data : error);
      const errorMessageText = (error.response && error.response.data && error.response.data.error && error.response.data.error.message) || "Error en el servidor al intentar eliminar personal.";
      setModalUserMessage({ type: 'error', text: errorMessageText });
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
    setModalUserMessage(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (rrhh) => {
    setFormData({
      legajo: rrhh.legajo,
      jerarquia_id: rrhh.jerarquia_id, // Assuming jerarquia_id is available directly
      situacion_id: rrhh.situacion_id, // Assuming situacion_id is available directly
      fecha_revision_medica: rrhh.fecha_revision_medica?.split("T")[0] || "",
    });
    setModalUserMessage(null);
    setIsEditModalOpen(true);
  };

  const totalPages = Math.ceil(personal.length / ITEMS_PER_PAGE);

  const isExpired = (date) => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return new Date(date) < oneYearAgo;
  };

  const personalFiltrado = useMemo(() => {
    return personal.filter((p) => {
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
  }, [personal, filtros]);

  const totalPagesFiltered = useMemo(() => {
    return Math.ceil(personalFiltrado.length / ITEMS_PER_PAGE);
  }, [personalFiltrado, ITEMS_PER_PAGE]);

  const currentPersonal = useMemo(() => {
    return personalFiltrado.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [personalFiltrado, currentPage, ITEMS_PER_PAGE]);

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
            onClick={() => {
              setModalUserMessage(null);
              setDeleteError(""); // Keep this if it's used for the input field validation styling/message
              setIsDeleteModalOpen(true);
            }}
          >
            Eliminar Personal
          </button>
        </>
      )}

      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Agregar Nuevo Personal</h3>
            {modalUserMessage && (
              <div className={`modal-message ${modalUserMessage.type === 'error' ? 'error-message' : 'success-message'}`}>
                {modalUserMessage.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
            )}
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
              onClick={() => {
                setIsAddModalOpen(false);
                setModalUserMessage(null);
              }}
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
            {modalUserMessage && (
              <div className={`modal-message ${modalUserMessage.type === 'error' ? 'error-message' : 'success-message'}`}>
                {modalUserMessage.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
            )}
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
                setModalUserMessage(null);
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
            {/* Display general modal messages here, if any, before confirmation */}
            {modalUserMessage && !confirmDelete && ( // Show only if not in confirm step or if message is general
              <div className={`modal-message ${modalUserMessage.type === 'error' ? 'error-message' : 'success-message'}`}>
                 {modalUserMessage.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
            )}
            <input
              type="text"
              className="filtro-input"
              placeholder="Ingrese el legajo"
              value={deleteLegajo}
              onChange={(e) => {
                setDeleteLegajo(e.target.value);
                setDeleteError(""); // Keep if specific input validation uses it
                setModalUserMessage(null); // Clear general message on input change
              }}
              required
            />
            <button
              className="confirm-delete-btn"
              onClick={() => {
                if (!deleteLegajo) {
                     setModalUserMessage({ type: 'error', text: "Por favor, ingrese un número de legajo válido." });
                     return;
                }
                setModalUserMessage(null); // Clear message before going to confirm
                setConfirmDelete(true);
                }
              }
            >
              Eliminar
            </button>
            <button
              className="close-modal-btn"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setModalUserMessage(null);
                setConfirmDelete(false);
              }}
            >
              Cancelar
            </button>
          </div>

          {confirmDelete && (
            <div className="confirm-overlay">
              <div className="confirm-content">
                <p>¿Está seguro? Esta acción no se puede deshacer.</p>
                {/* Display message specific to the confirmation step */}
                {modalUserMessage && (
                  <div className={`modal-message ${modalUserMessage.type === 'error' ? 'error-message' : 'success-message'}`}>
                    {modalUserMessage.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                  </div>
                )}
                {/* Fallback for deleteError if it's still used for something specific */}
                {deleteError && !modalUserMessage && <p className="error-message">{deleteError}</p>}
                <button className="confirm-delete-btn" onClick={handleDelete}>
                  Confirmar
                </button>
                <button
                  className="close-modal-btn"
                  onClick={() => {
                    setConfirmDelete(false);
                    setModalUserMessage(null); // Clear message when cancelling confirm
                  }}
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
