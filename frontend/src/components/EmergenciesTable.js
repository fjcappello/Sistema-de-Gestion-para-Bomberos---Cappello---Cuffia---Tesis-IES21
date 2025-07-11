import React, { useEffect, useState } from "react";
import api from "../api";
import "./Styles/EmergenciesTable.css";
import "./Styles/Tablas.css";
import PDFGenerator from "./PDFGenerator";
import { useUsuario } from "../context/UserContext";

const ITEMS_PER_PAGE = 5;

function EmergenciesTable() {
  // Estados para datos
  // Usuario
  const { usuario } = useUsuario();
  const [emergencies, setEmergencies] = useState([]);
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [jefesDotacion, setJefesDotacion] = useState([]);
  const [tipoAsistenciaOptions, setTipoAsistenciaOptions] = useState([]);

  // Estados para filtros
  const [filters, setFilters] = useState({
    jefeDotacion: "",
    tipoAsistencia: "",
    startDate: "",
    endDate: "",
    denunciante: "",
  });

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para modales
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isBitacoraModalOpen, setIsBitacoraModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bitacoraText, setBitacoraText] = useState("");

  // Estados para selección y control
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [deleteParteId, setDeleteParteId] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Estado para formulario de agregar
  const [formData, setFormData] = useState({
    nombre_denunciante: "",
    apellido_denunciante: "",
    documento_denunciante: "",
    direccion: "",
    tipo_asistencia: "",
    jefe_dotacion: "",
    parte_escrito: "",
    fecha: "",
  });

  // Determinar si una emergencia está activa
  const isEmergenciaActiva = (emergencia) => {
    // Ajusta estas condiciones según los valores reales de tu backend
    return (
      emergencia.estado === "Activo" ||
      emergencia.estado === "En curso" ||
      emergencia.estado === "1"
    ); // Ejemplo si usas números
  };

  // Obtener datos iniciales
  useEffect(() => {
    fetchEmergencies();
    fetchJefesDotacion();
    fetchTipoAsistencia();
  }, []);

  // Fetch de datos
  const fetchEmergencies = async () => {
    try {
      const response = await api.get("/partesemergencias");
      setEmergencies(response.data);
      setFilteredEmergencies(response.data);
    } catch (error) {
      console.error("Error al obtener emergencias:", error);
    }
  };

  const fetchJefesDotacion = async () => {
    try {
      const response = await api.get("/personal_nombres");
      setJefesDotacion(response.data);
    } catch (error) {
      console.error("Error al obtener jefes de dotación:", error);
    }
  };

  const fetchTipoAsistencia = async () => {
    try {
      const response = await api.get("/tipos_asistencia");
      setTipoAsistenciaOptions(response.data);
    } catch (error) {
      console.error("Error al obtener tipos de asistencia:", error);
    }
  };

  // Manejo de filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleApplyFilters = () => {
    const filtered = emergencies.filter((emergencia) => {
      const matchesDenunciante =
        !filters.denunciante ||
        emergencia.nombre_denunciante
          ?.toLowerCase()
          .includes(filters.denunciante.toLowerCase()) ||
        emergencia.apellido_denunciante
          ?.toLowerCase()
          .includes(filters.denunciante.toLowerCase());

      const matchesTipoAsistencia =
        !filters.tipoAsistencia ||
        emergencia.tipo_asistencia === filters.tipoAsistencia;

      const selectedJefe = jefesDotacion.find(
        (j) => j.id == filters.jefeDotacion
      );
      const matchesJefeDotacion =
        !filters.jefeDotacion ||
        (selectedJefe &&
          emergencia.jefe_dotacion === selectedJefe.nombre_completo);

      if (filters.startDate || filters.endDate) {
        const [day, month, year] = emergencia.fecha.split("-");
        const emergenciaDateFormatted = `${year}-${month}-${day}`;

        if (filters.startDate && emergenciaDateFormatted < filters.startDate)
          return false;
        if (filters.endDate && emergenciaDateFormatted > filters.endDate)
          return false;
      }

      return matchesDenunciante && matchesTipoAsistencia && matchesJefeDotacion;
    });

    setFilteredEmergencies(filtered);
    setCurrentPage(1);
  };

  // Manejo de paginación
  const totalPages = Math.ceil(filteredEmergencies.length / ITEMS_PER_PAGE);
  const currentEmergencies = filteredEmergencies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Manejo de bitácora
  const openBitacoraModal = (parteId) => {
    setSelectedPartId(parteId);
    setIsBitacoraModalOpen(true);
    setBitacoraText("");
  };

  const closeBitacoraModal = () => {
    setIsBitacoraModalOpen(false);
    setBitacoraText("");
    setSelectedPartId(null);
  };

  const handleConfirmBitacora = async () => {
    if (!bitacoraText || !selectedPartId) {
      alert("Por favor complete el reporte");
      return;
    }
    try {
      const id_personal = 1;
      const response = await api.post("/bitacora", {
        id_personal: id_personal,
        reporte: bitacoraText,
        parte_id: selectedPartId,
      });

      if (response.data.success) {
        alert("Bitácora guardada correctamente");
        closeBitacoraModal();
        fetchEmergencies();
      } else {
        alert("Ocurrió un error al guardar la bitácora");
      }
    } catch (error) {
      console.error("Error en la solicitud POST:", error);
      alert(
        `Error al guardar la bitácora: ${
          error.response?.data?.error || error.message
        }`
      );
    }
  };

  // Manejo de PDF
  const handleGeneratePDF = (partData) => {
    setSelectedPart(partData);
    setIsPDFModalOpen(true);
  };

  const closePDFModal = () => {
    setIsPDFModalOpen(false);
    setSelectedPart(null);
  };

  // Renderizado de botones según estado
  const renderReportButton = (emergencia) => {
    const activa = isEmergenciaActiva(emergencia);
    const esJefeAsignado =
      emergencia.jefe_dotacion === usuario?.nombreCompleto ||
      usuario?.rol === "Jefatura";

    return (
      <button
        onClick={() =>
          activa && esJefeAsignado && openBitacoraModal(emergencia.parte_id)
        }
        disabled={!activa || !esJefeAsignado}
        className={`generate-report-btn ${
          !activa || !esJefeAsignado ? "disabled-btn" : ""
        }`}
        title={
          !activa
            ? "Emergencia finalizada - No se pueden agregar más reportes"
            : !esJefeAsignado
            ? "Solo el jefe asignado puede generar el reporte"
            : "Generar reporte de bitácora"
        }
      >
        Generar reporte
      </button>
    );
  };

  const renderPdfButton = (emergencia) => {
    const finalizada = !isEmergenciaActiva(emergencia);
    return (
      <button
        onClick={() => finalizada && handleGeneratePDF(emergencia)}
        disabled={!finalizada}
        className={`generate-pdf-btn ${!finalizada ? "disabled-btn" : ""}`}
        title={
          !finalizada
            ? "Solo disponible para emergencias finalizadas"
            : "Generar PDF del reporte"
        }
      >
        Generar PDF
      </button>
    );
  };

  // Función para manejar agregar emergencia
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/partesemergencias", formData);
      if (response.data.success) {
        alert("Emergencia agregada correctamente");
        setIsAddModalOpen(false);
        setFormData({
          nombre_denunciante: "",
          apellido_denunciante: "",
          documento_denunciante: "",
          direccion: "",
          tipo_asistencia: "",
          jefe_dotacion: "",
          parte_escrito: "",
          fecha: "",
        });
        fetchEmergencies();
      } else {
        alert("Error al agregar el reporte");
      }
    } catch (error) {
      console.error("Error en la solicitud POST:", error);
      alert("Error al intentar agregar el reporte.");
    }
  };

  // Función para manejar borrado
  const handleDelete = async () => {
    if (!deleteParteId) {
      setDeleteError("Por favor, ingrese un ID válido.");
      return;
    }
    try {
      const response = await api.delete(`/eliminarEmergencia/${deleteParteId}`);
      if (response.data.success) {
        alert("Reporte eliminado correctamente");
        setIsDeleteModalOpen(false);
        setDeleteParteId("");
        setDeleteError("");
        fetchEmergencies();
      } else {
        setDeleteError("Error al eliminar el reporte.");
      }
    } catch (error) {
      console.error("Error al intentar eliminar el reporte:", error);
      setDeleteError("Error en el servidor.");
    }
  };

  // Renderizado visual
  return (
    <div className="table-container">
      <h2 className="table-title">Registro de Emergencias</h2>
      <div className="botonera_tablas">
        <div>
          <button
            className="add-report-btn"
            onClick={() => setIsAddModalOpen(true)}
          >Agregar Nuevo Reporte
          </button>
        </div>  
          {["Administrador", "Jefatura"].includes(usuario?.rol) && (
          <div>
            <button
              className="delete-report-btn"
              onClick={() => setIsDeleteModalOpen(true)}
            >Eliminar Reporte
            </button>
          </div>)}
      </div>

      {/* Filtros */}
        <div className="filtros">
          <select
            name="tipoAsistencia"
            value={filters.tipoAsistencia}
            onChange={handleFilterChange}
          >
            <option value="">Todos los tipos</option>
            {tipoAsistenciaOptions.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>

          <select
            name="jefeDotacion"
            value={filters.jefeDotacion}
            onChange={handleFilterChange}
          >
            <option value="">Todos los jefes</option>
            {jefesDotacion.map((jefe) => (
              <option key={jefe.id} value={jefe.id}>
                {jefe.nombre_completo}
              </option>
            ))}
          </select>
          <label>Fecha desde:</label>
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            placeholder="Desde"
          />
          <label>Fecha hasta:</label>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            placeholder="Hasta"
          />

          <input
            type="text"
            name="denunciante"
            placeholder="Nombre del denunciante"
            value={filters.denunciante}
            onChange={handleFilterChange}
          />

          <button onClick={handleApplyFilters} className="filter-btn">
            Aplicar Filtros
          </button>
        </div>


      {/* Tabla */}
      <table className="table-fluent">
        <thead>
          <tr>
            <th>Parte ID</th>
            <th>Número de Parte</th>
            <th>Fecha</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Documento</th>
            <th>Dirección</th>
            <th>Tipo de Asistencia</th>
            <th>Jefe de Dotación</th>
            <th>Info adicional</th>
            <th>Estado</th>
            <th>Reporte escrito</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentEmergencies.length > 0 ? (
            currentEmergencies.map((emergencia) => (
              <tr key={emergencia.parte_id}>
                <td>{emergencia.parte_id}</td>
                <td>{emergencia.numero_parte}</td>
                <td style={{ whiteSpace: "nowrap" }}>{emergencia.fecha}</td>
                <td>{emergencia.nombre_denunciante}</td>
                <td>{emergencia.apellido_denunciante}</td>
                <td>{emergencia.documento_denunciante}</td>
                <td>{emergencia.direccion}</td>
                <td>{emergencia.tipo_asistencia}</td>
                <td>{emergencia.jefe_dotacion}</td>
                <td
                  title={emergencia.parte_escrito}
                  style={{
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {emergencia.parte_escrito.length > 40
                    ? `${emergencia.parte_escrito.substring(0, 40)}...`
                    : emergencia.parte_escrito}
                </td>
                <td>{emergencia.estado}</td>
                <td>{renderReportButton(emergencia)}</td>
                <td>{renderPdfButton(emergencia)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="13"
                style={{ textAlign: "center", padding: "1rem", color: "#555" }}
              >
                No hay emergencias cargadas
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={currentPage === 1 ? "disabled-btn" : ""}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {totalPages || 1}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={
            currentPage === totalPages || totalPages === 0 ? "disabled-btn" : ""
          }
        >
          Siguiente
        </button>
      </div>

      



      {/* Modal para Agregar Reporte */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3
              style={{
                margin: "0 0 1rem 0",
                padding: "1.5rem 1.5rem 0",
                color: "#333",
                fontSize: "1.25rem",
              }}
            >
              Agregar Nuevo Reporte
            </h3>

            <form onSubmit={handleAddSubmit} className="form-container">
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <input
                  type="text"
                  name="nombre_denunciante"
                  placeholder="Nombre"
                  value={formData.nombre_denunciante}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nombre_denunciante: e.target.value,
                    })
                  }
                  required
                />
                <input
                  type="text"
                  name="apellido_denunciante"
                  placeholder="Apellido"
                  value={formData.apellido_denunciante}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      apellido_denunciante: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <input
                type="number"
                name="documento_denunciante"
                placeholder="Documento de identidad"
                value={formData.documento_denunciante}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    documento_denunciante: e.target.value,
                  })
                }
                required
              />

              <input
                type="text"
                name="direccion"
                placeholder="Dirección completa"
                value={formData.direccion}
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
                required
              />

              <input
                type="text"
                name="tipo_asistencia"
                placeholder="Tipo de asistencia requerida"
                value={formData.tipo_asistencia}
                onChange={(e) =>
                  setFormData({ ...formData, tipo_asistencia: e.target.value })
                }
                required
              />

              <select
                name="jefe_dotacion"
                value={formData.jefe_dotacion}
                onChange={(e) =>
                  setFormData({ ...formData, jefe_dotacion: e.target.value })
                }
                required
              >
                <option value="">Seleccione Jefe de Dotación</option>
                {jefesDotacion.map((jefe) => (
                  <option key={jefe.id} value={jefe.id}>
                    {jefe.nombre_completo}
                  </option>
                ))}
              </select>

              <label>Fecha de intervención:</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
                required
              />

              <textarea
                name="parte_escrito"
                placeholder="Descripción detallada del incidente..."
                style={{ width: "100%", marginBottom: "1rem", resize: "none" }}
                value={formData.parte_escrito}
                onChange={(e) =>
                  setFormData({ ...formData, parte_escrito: e.target.value })
                }
                required
              />
              <div className="form-buttons">
                <button type="submit" className="confirm-btn">
                  Guardar Reporte
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Eliminar Reporte */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Eliminar Reporte</h3>
            <input
              type="number"
              placeholder="Ingrese el ID del parte a eliminar"
              value={deleteParteId}
              onChange={(e) => setDeleteParteId(e.target.value)}
              className="delete-input"
            />
            {deleteError && <p className="error-message">{deleteError}</p>}
            <div className="modal-buttons">
              <button onClick={handleDelete} className="confirm-delete-btn">
                Eliminar
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="cancel-btn"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bitácora */}
      {isBitacoraModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Reporte de Emergencia</h3>
            <textarea
              value={bitacoraText}
              onChange={(e) => setBitacoraText(e.target.value)}
              placeholder="Escriba aquí el reporte de la emergencia..."
              rows={8}
              style={{ width: "100%", marginBottom: "1rem", resize: "none" }}
            />
            <div class="modal-buttons">
              <button onClick={handleConfirmBitacora} className="confirm-btn">
                Confirmar
              </button>
              <button onClick={closeBitacoraModal} className="cancel-btn">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de PDF */}
      {isPDFModalOpen && selectedPart && (
        <PDFGenerator partData={selectedPart} onClose={closePDFModal} />
      )}
    </div>
  );
}

export default EmergenciesTable;
