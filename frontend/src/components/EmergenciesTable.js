import React, { useEffect, useState } from "react";
import api from "../api";
import "./Styles/EmergenciesTable.css"; // Estilos Fluent
import PDFGenerator from "./PDFGenerator"; // Este componente también necesitará revisión de estilos si genera UI
import { useUsuario } from "../context/UserContext";

const ITEMS_PER_PAGE = 7; // Un poco más para aprovechar el espacio

// Icono de Cierre (X) simple para el modal (reutilizado)
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
  </svg>
);


function EmergenciesTable() {
  const { usuario } = useUsuario();
  const [emergencies, setEmergencies] = useState([]);
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [jefesDotacion, setJefesDotacion] = useState([]);
  const [tipoAsistenciaOptions, setTipoAsistenciaOptions] = useState([]);

  const [filters, setFilters] = useState({
    jefeDotacion: "",
    tipoAsistencia: "",
    startDate: "",
    endDate: "",
    denunciante: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [isBitacoraModalOpen, setIsBitacoraModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bitacoraText, setBitacoraText] = useState("");
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedPartId, setSelectedPartId] = useState(null);
  const [deleteParteId, setDeleteParteId] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const initialFormData = {
    nombre_denunciante: "",
    apellido_denunciante: "",
    documento_denunciante: "",
    direccion: "",
    tipo_asistencia: "",
    jefe_dotacion: "",
    parte_escrito: "",
    fecha: new Date().toISOString().split("T")[0], // Fecha actual por defecto
  };
  const [formData, setFormData] = useState(initialFormData);

  const isEmergenciaActiva = (emergencia) =>
    emergencia.estado === "Activo" || emergencia.estado === "En curso" || emergencia.estado === "1";

  useEffect(() => {
    fetchEmergencies();
    fetchJefesDotacion();
    fetchTipoAsistencia();
  }, []);

  const fetchEmergencies = async () => {
    try {
      const response = await api.get("/partesemergencias");
      setEmergencies(response.data);
      setFilteredEmergencies(response.data); // Inicialmente mostrar todas
    } catch (error) {
      console.error("Error al obtener emergencias:", error);
    }
  };

  const fetchJefesDotacion = async () => {
    try {
      const response = await api.get("/personal_nombres"); // Asumiendo que este devuelve {id, nombre_completo}
      setJefesDotacion(response.data);
    } catch (error) {
      console.error("Error al obtener jefes de dotación:", error);
    }
  };

  const fetchTipoAsistencia = async () => {
    try {
      const response = await api.get("/tipos_asistencia"); // Asumiendo que este devuelve un array de strings
      setTipoAsistenciaOptions(response.data);
    } catch (error) {
      console.error("Error al obtener tipos de asistencia:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleApplyFilters = () => {
    let tempFiltered = [...emergencies];
    if (filters.denunciante) {
      tempFiltered = tempFiltered.filter(e =>
        (e.nombre_denunciante?.toLowerCase().includes(filters.denunciante.toLowerCase()) ||
         e.apellido_denunciante?.toLowerCase().includes(filters.denunciante.toLowerCase()))
      );
    }
    if (filters.tipoAsistencia) {
      tempFiltered = tempFiltered.filter(e => e.tipo_asistencia === filters.tipoAsistencia);
    }
    if (filters.jefeDotacion) {
        // Asumiendo que filters.jefeDotacion es el ID del jefe
        const selectedJefeObj = jefesDotacion.find(j => j.id.toString() === filters.jefeDotacion);
        if (selectedJefeObj) {
            tempFiltered = tempFiltered.filter(e => e.jefe_dotacion === selectedJefeObj.nombre_completo);
        }
    }
    if (filters.startDate) {
        tempFiltered = tempFiltered.filter(e => {
            const [day, month, year] = e.fecha.split("-");
            return `${year}-${month}-${day}` >= filters.startDate;
        });
    }
    if (filters.endDate) {
        tempFiltered = tempFiltered.filter(e => {
            const [day, month, year] = e.fecha.split("-");
            return `${year}-${month}-${day}` <= filters.endDate;
        });
    }
    setFilteredEmergencies(tempFiltered);
    setCurrentPage(1);
  };

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

  const openBitacoraModal = (parteId) => {
    setSelectedPartId(parteId);
    setIsBitacoraModalOpen(true);
    setBitacoraText("");
  };
  const closeBitacoraModal = () => setIsBitacoraModalOpen(false);

  const handleConfirmBitacora = async () => {
    if (!bitacoraText.trim() || !selectedPartId) {
      alert("Por favor complete el reporte de bitácora.");
      return;
    }
    try {
      // const id_personal = usuario?.legajo; // Usar el legajo del usuario logueado
      const response = await api.post("/bitacora", {
        id_personal: usuario?.legajo, // Asegúrate que esto es correcto
        reporte: bitacoraText,
        parte_id: selectedPartId,
      });
      if (response.data.success) {
        alert("Bitácora guardada correctamente.");
        closeBitacoraModal();
        fetchEmergencies();
      } else {
        alert(response.data.message || "Ocurrió un error al guardar la bitácora.");
      }
    } catch (error) {
      alert(`Error al guardar la bitácora: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleGeneratePDF = (partData) => {
    setSelectedPart(partData);
    setIsPDFModalOpen(true);
  };
  const closePDFModal = () => setIsPDFModalOpen(false);

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/crearEmergencia", formData);
      if (response.data.success) {
        alert("Emergencia agregada correctamente.");
        setIsAddModalOpen(false);
        setFormData(initialFormData); // Reset form
        fetchEmergencies();
      } else {
        alert(response.data.message || "Error al agregar el reporte.");
      }
    } catch (error) {
      alert(`Error al agregar el reporte: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteParteId) {
      setDeleteError("Por favor, ingrese un ID de parte válido.");
      return;
    }
    if (!window.confirm(`¿Está seguro de que desea eliminar el parte ID: ${deleteParteId}? Esta acción no se puede deshacer.`)) {
        return;
    }
    try {
      const response = await api.delete(`/eliminarEmergencia/${deleteParteId}`);
      if (response.data.success) {
        alert("Reporte eliminado correctamente.");
        setIsDeleteModalOpen(false);
        setDeleteParteId("");
        setDeleteError("");
        fetchEmergencies();
      } else {
        setDeleteError(response.data.message || "Error al eliminar el reporte.");
      }
    } catch (error) {
      setDeleteError(`Error en el servidor: ${error.response?.data?.message || error.message}`);
    }
  };


  return (
    <div className="emergencies-table-view-container"> {/* Contenedor Fluent */}
      <h2 className="emergencies-table-title">Registro de Emergencias</h2>

      <div className="emergencies-filter-container"> {/* Contenedor Fluent */}
        <select
          name="tipoAsistencia"
          value={filters.tipoAsistencia}
          onChange={handleFilterChange}
          className="form-control-fluent" // Clase Fluent
        >
          <option value="">Todos los tipos</option>
          {tipoAsistenciaOptions.map((tipo, index) => ( // Añadido key
            <option key={index} value={tipo}> {/* Asumir que tipo es string único */}
              {tipo}
            </option>
          ))}
        </select>

        <select
          name="jefeDotacion"
          value={filters.jefeDotacion}
          onChange={handleFilterChange}
          className="form-control-fluent" // Clase Fluent
        >
          <option value="">Todos los jefes</option>
          {jefesDotacion.map((jefe) => (
            <option key={jefe.id} value={jefe.id}> {/* Usar jefe.id como value */}
              {jefe.nombre_completo}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="form-control-fluent" // Clase Fluent
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="form-control-fluent" // Clase Fluent
        />
        <input
          type="text"
          name="denunciante"
          placeholder="Buscar por denunciante..."
          value={filters.denunciante}
          onChange={handleFilterChange}
          className="form-control-fluent" // Clase Fluent
        />
        <button onClick={handleApplyFilters} className="btn-fluent"> {/* Botón Fluent */}
          Aplicar Filtros
        </button>
      </div>

      <table className="table-fluent emergencies-table"> {/* Clases Fluent */}
        <thead>
          <tr>
            <th>ID Parte</th>
            <th>N° Parte</th>
            <th>Fecha</th>
            <th>Denunciante</th>
            {/* <th>Apellido</th>
            <th>Documento</th> */}
            <th>Dirección</th>
            <th>Tipo Asistencia</th>
            <th>Jefe Dotación</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Bitácora</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody>
          {currentEmergencies.length > 0 ? (
            currentEmergencies.map((emergencia) => (
              <tr key={emergencia.parte_id}>
                <td>{emergencia.parte_id}</td>
                <td>{emergencia.numero_parte}</td>
                <td style={{ whiteSpace: "nowrap" }}>{emergencia.fecha}</td>
                <td>{`${emergencia.nombre_denunciante} ${emergencia.apellido_denunciante}`} <small>({emergencia.documento_denunciante})</small></td>
                {/* <td>{emergencia.apellido_denunciante}</td>
                <td>{emergencia.documento_denunciante}</td> */}
                <td>{emergencia.direccion}</td>
                <td>{emergencia.tipo_asistencia}</td>
                <td>{emergencia.jefe_dotacion}</td>
                <td
                  title={emergencia.parte_escrito}
                  style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {emergencia.parte_escrito}
                </td>
                <td>{emergencia.estado}</td>
                <td>
                  <button
                    onClick={() => isEmergenciaActiva(emergencia) && emergencia.jefe_dotacion === usuario?.nombreCompleto && openBitacoraModal(emergencia.parte_id)}
                    disabled={!isEmergenciaActiva(emergencia) || emergencia.jefe_dotacion !== usuario?.nombreCompleto}
                    className={`btn-fluent btn-fluent-outline ${(!isEmergenciaActiva(emergencia) || emergencia.jefe_dotacion !== usuario?.nombreCompleto) ? "disabled-btn" : ""}`}
                    title={!isEmergenciaActiva(emergencia) ? "Emergencia finalizada" : (emergencia.jefe_dotacion !== usuario?.nombreCompleto ? "No es jefe asignado" : "Generar reporte")}
                  >
                    Bitácora
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => !isEmergenciaActiva(emergencia) && handleGeneratePDF(emergencia)}
                    disabled={isEmergenciaActiva(emergencia)}
                    className={`btn-fluent btn-fluent-outline ${isEmergenciaActiva(emergencia) ? "disabled-btn" : ""}`}
                    title={isEmergenciaActiva(emergencia) ? "Debe estar finalizada" : "Generar PDF"}
                  >
                    PDF
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" style={{ textAlign: "center" }}> {/* Ajustar colspan */}
                No hay emergencias que coincidan con los filtros o no hay emergencias cargadas.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="emergencies-pagination"> {/* Clase Fluent */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="btn-fluent btn-fluent-outline" // Clase Fluent
        >
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages || 1}</span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="btn-fluent btn-fluent-outline" // Clase Fluent
        >
          Siguiente
        </button>
      </div>

      <div className="emergencies-action-buttons"> {/* Clase Fluent */}
        <button className="btn-fluent btn-fluent-primary" onClick={() => setIsAddModalOpen(true)}>
          Agregar Nuevo Reporte
        </button>
        {["Administrador", "Jefatura"].includes(usuario?.rol) && (
          <button className="btn-fluent btn-fluent-danger" onClick={() => setIsDeleteModalOpen(true)}>
            Eliminar Reporte
          </button>
        )}
      </div>

      {/* Modal para Agregar Reporte */}
      {isAddModalOpen && (
        <div className="modal-overlay-fluent">
          <div className="modal-window-fluent" style={{maxWidth: '700px'}}>
            <div className="modal-header-fluent">
              <h3 className="modal-title-fluent">Agregar Nuevo Reporte de Emergencia</h3>
              <button type="button" className="modal-close-btn-fluent" onClick={() => setIsAddModalOpen(false)} aria-label="Cerrar">
                <CloseIcon />
              </button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="modal-body-fluent emergencies-modal-form-container">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
                  <div className="form-group-fluent">
                    <label htmlFor="add_nombre_denunciante" className="form-label-fluent">Nombre Denunciante</label>
                    <input id="add_nombre_denunciante" type="text" name="nombre_denunciante" value={formData.nombre_denunciante} onChange={handleAddInputChange} className="form-control-fluent" required />
                  </div>
                  <div className="form-group-fluent">
                    <label htmlFor="add_apellido_denunciante" className="form-label-fluent">Apellido Denunciante</label>
                    <input id="add_apellido_denunciante" type="text" name="apellido_denunciante" value={formData.apellido_denunciante} onChange={handleAddInputChange} className="form-control-fluent" required />
                  </div>
                </div>
                <div className="form-group-fluent">
                  <label htmlFor="add_documento_denunciante" className="form-label-fluent">Documento Denunciante</label>
                  <input id="add_documento_denunciante" type="number" name="documento_denunciante" value={formData.documento_denunciante} onChange={handleAddInputChange} className="form-control-fluent" required />
                </div>
                <div className="form-group-fluent">
                  <label htmlFor="add_direccion" className="form-label-fluent">Dirección del Incidente</label>
                  <input id="add_direccion" type="text" name="direccion" value={formData.direccion} onChange={handleAddInputChange} className="form-control-fluent" required />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
                  <div className="form-group-fluent">
                    <label htmlFor="add_tipo_asistencia" className="form-label-fluent">Tipo de Asistencia</label>
                    <select id="add_tipo_asistencia" name="tipo_asistencia" value={formData.tipo_asistencia} onChange={handleAddInputChange} className="form-control-fluent" required>
                        <option value="">Seleccione tipo...</option>
                        {tipoAsistenciaOptions.map((tipo, index) => <option key={index} value={tipo}>{tipo}</option>)}
                    </select>
                  </div>
                  <div className="form-group-fluent">
                    <label htmlFor="add_jefe_dotacion" className="form-label-fluent">Jefe de Dotación</label>
                    <select id="add_jefe_dotacion" name="jefe_dotacion" value={formData.jefe_dotacion} onChange={handleAddInputChange} className="form-control-fluent" required>
                      <option value="">Seleccione Jefe...</option>
                      {jefesDotacion.map((jefe) => <option key={jefe.id} value={jefe.id}>{jefe.nombre_completo}</option>)}
                    </select>
                  </div>
                </div>
                 <div className="form-group-fluent">
                    <label htmlFor="add_fecha" className="form-label-fluent">Fecha de Intervención</label>
                    <input id="add_fecha" type="date" name="fecha" value={formData.fecha} onChange={handleAddInputChange} className="form-control-fluent" required />
                </div>
                <div className="form-group-fluent">
                  <label htmlFor="add_parte_escrito" className="form-label-fluent">Descripción Detallada (Parte Escrito)</label>
                  <textarea id="add_parte_escrito" name="parte_escrito" value={formData.parte_escrito} onChange={handleAddInputChange} className="form-control-fluent" rows="4" required />
                </div>
              </div>
              <div className="modal-footer-fluent">
                <button type="button" className="btn-fluent" onClick={() => setIsAddModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-fluent btn-fluent-primary">Guardar Reporte</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Eliminar Reporte */}
      {isDeleteModalOpen && (
        <div className="modal-overlay-fluent">
          <div className="modal-window-fluent" style={{maxWidth: '450px'}}>
            <div className="modal-header-fluent">
              <h3 className="modal-title-fluent">Eliminar Reporte de Emergencia</h3>
               <button type="button" className="modal-close-btn-fluent" onClick={() => setIsDeleteModalOpen(false)} aria-label="Cerrar">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body-fluent emergencies-modal-form-container">
              <div className="form-group-fluent">
                <label htmlFor="delete_parte_id" className="form-label-fluent">ID del Parte a Eliminar:</label>
                <input
                    id="delete_parte_id"
                    type="number"
                    placeholder="Ingrese ID"
                    value={deleteParteId}
                    onChange={(e) => { setDeleteParteId(e.target.value); setDeleteError(''); }}
                    className="form-control-fluent delete-report-id-input"
                />
              </div>
              {deleteError && <p className="emergencies-error-message">{deleteError}</p>}
            </div>
            <div className="modal-footer-fluent">
              <button type="button" className="btn-fluent" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button onClick={handleDelete} className="btn-fluent btn-fluent-danger">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bitácora */}
      {isBitacoraModalOpen && (
        <div className="modal-overlay-fluent">
          <div className="modal-window-fluent" style={{maxWidth: '600px'}}>
            <div className="modal-header-fluent">
              <h3 className="modal-title-fluent">Reporte de Bitácora (Parte ID: {selectedPartId})</h3>
              <button type="button" className="modal-close-btn-fluent" onClick={closeBitacoraModal} aria-label="Cerrar">
                <CloseIcon />
              </button>
            </div>
            <div className="modal-body-fluent emergencies-modal-form-container">
                <div className="form-group-fluent">
                    <label htmlFor="bitacora_text_area" className="form-label-fluent">Detalle de la Bitácora:</label>
                    <textarea
                        id="bitacora_text_area"
                        value={bitacoraText}
                        onChange={(e) => setBitacoraText(e.target.value)}
                        placeholder="Escriba aquí el reporte de la emergencia..."
                        rows={10}
                        className="form-control-fluent"
                    />
                </div>
                <div className="bitacora-preview-fluent">
                    <h4>Previsualización:</h4>
                    <div className="bitacora-content-fluent">
                        {bitacoraText || "No hay texto para previsualizar."}
                    </div>
                </div>
            </div>
            <div className="modal-footer-fluent">
              <button type="button" className="btn-fluent" onClick={closeBitacoraModal}>Cancelar</button>
              <button onClick={handleConfirmBitacora} className="btn-fluent btn-fluent-primary">Confirmar Bitácora</button>
            </div>
          </div>
        </div>
      )}

      {isPDFModalOpen && selectedPart && (
        <PDFGenerator partData={selectedPart} onClose={closePDFModal} />
      )}
    </div>
  );
}

export default EmergenciesTable;
