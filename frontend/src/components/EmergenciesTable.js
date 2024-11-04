import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmergenciesTable.css';

const ITEMS_PER_PAGE = 5;

function EmergenciesTable() {
  const [emergencies, setEmergencies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [jefesDotacion, setJefesDotacion] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteParteId, setDeleteParteId] = useState(''); // ID del parte a eliminar
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [formData, setFormData] = useState({
    nombre_denunciante: '',
    apellido_denunciante: '',
    documento_denunciante: '',
    direccion: '',
    tipo_asistencia: '',
    jefe_dotacion: '',
    parte_escrito: '',
    fecha: ''
  });

  const fetchEmergencies = async () => {
    try {
      const response = await axios.get('http://localhost:3001/partesemergencias');
      setEmergencies(response.data);
    } catch (error) {
      console.error("Error al obtener emergencias:", error);
    }
  };

  const fetchJefesDotacion = async () => {
    try {
      const response = await axios.get('http://localhost:3001/personal_nombres');
      setJefesDotacion(response.data);
    } catch (error) {
      console.error("Error al obtener jefes de dotación:", error);
    }
  };

  useEffect(() => {
    fetchEmergencies();
    fetchJefesDotacion();
    const interval = setInterval(fetchEmergencies, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/partesemergencias', formData);
      if (response.data.success) {
        alert("Reporte agregado correctamente");
        setFormData({
          nombre_denunciante: '',
          apellido_denunciante: '',
          documento_denunciante: '',
          direccion: '',
          tipo_asistencia: '',
          jefe_dotacion: '',
          parte_escrito: '',
          fecha: ''
        });
        setIsModalOpen(false);
        fetchEmergencies();
      } else {
        console.error("Error al agregar el reporte:", response.data.error);
        alert("Error al agregar el reporte: " + (response.data.error || "Operación fallida"));
      }
    } catch (error) {
      console.error("Error en la solicitud POST:", error);
      alert("Error al intentar agregar el reporte. Verifica que el servidor esté en ejecución y que la conexión sea correcta.");
    }
  };

  const handleDelete = async () => {
    if (!deleteParteId) {
      setDeleteError("Por favor, ingrese un ID válido.");
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:3001/partesemergencias/${deleteParteId}`);
      if (response.data.success) {
        alert("Reporte eliminado correctamente");
        setIsDeleteModalOpen(false);
        setDeleteParteId('');
        setDeleteError('');
        fetchEmergencies();
      } else {
        setDeleteError("Error al eliminar el reporte: " + (response.data.error || "Operación fallida"));
      }
    } catch (error) {
      console.error("Error al intentar eliminar el reporte:", error.response || error.message || error);
      setDeleteError("Error al intentar eliminar el reporte. Verifique que el ID sea correcto.");
    }
  }

  const openAddReportModal = () => {
    setFormData({
      nombre_denunciante: '',
      apellido_denunciante: '',
      documento_denunciante: '',
      direccion: '',
      tipo_asistencia: '',
      jefe_dotacion: '',
      parte_escrito: '',
      fecha: ''
    });
    setIsModalOpen(true);
  };

  const openDeleteReportModal = () => {
    setDeleteParteId('');
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const totalPages = Math.ceil(emergencies.length / ITEMS_PER_PAGE);
  const currentEmergencies = emergencies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="table-container">
      <table className="emergencies-table">
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
            <th>Información adicional</th>
          </tr>
        </thead>
        <tbody>
          {currentEmergencies.length > 0 ? (
            currentEmergencies.map((emergencia) => (
              <tr key={emergencia.parte_id}>
                <td>{emergencia.parte_id}</td>
                <td>{emergencia.numero_parte}</td>
                <td>{emergencia.fecha}</td>
                <td>{emergencia.nombre_denunciante}</td>
                <td>{emergencia.apellido_denunciante}</td>
                <td>{emergencia.documento_denunciante}</td>
                <td>{emergencia.direccion}</td>
                <td>{emergencia.tipo_asistencia}</td>
                <td>{emergencia.jefe_dotacion}</td>
                <td>{emergencia.parte_escrito}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" style={{ textAlign: 'center', padding: '1rem', color: '#555' }}>
                No hay emergencias cargadas
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
          Siguiente
        </button>
      </div>

      <button className="add-report-btn" onClick={openAddReportModal}>
        Agregar Nuevo Reporte
      </button>
      <button className="delete-report-btn" onClick={openDeleteReportModal}>
        Eliminar Reporte
      </button>

      {/* Modal de agregar reporte */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Agregar Nuevo Reporte</h3>
            <form onSubmit={handleSubmit} className="form-container">
              <input
                type="text"
                name="nombre_denunciante"
                placeholder="Nombre del denunciante"
                value={formData.nombre_denunciante}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="apellido_denunciante"
                placeholder="Apellido del denunciante"
                value={formData.apellido_denunciante}
                onChange={handleInputChange}
                required
              />
              <input
                type="number"
                name="documento_denunciante"
                placeholder="Documento del denunciante"
                value={formData.documento_denunciante}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="direccion"
                placeholder="Dirección"
                value={formData.direccion}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="tipo_asistencia"
                placeholder="Tipo de Asistencia"
                value={formData.tipo_asistencia}
                onChange={handleInputChange}
                required
              />
              <select
                name="jefe_dotacion"
                value={formData.jefe_dotacion}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione Jefe de Dotación</option>
                {jefesDotacion.map((jefe) => (
                  <option key={jefe.id} value={jefe.id}>
                    {jefe.nombre_completo}
                  </option>
                ))}
              </select>
              <textarea
                name="parte_escrito"
                placeholder="Información adicional"
                value={formData.parte_escrito}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="fecha">Fecha de intervención:</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                required
              />
              <button type="submit" className="submit-btn">Agregar Reporte</button>
            </form>
            <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Modal de eliminación de reporte */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Eliminar Reporte</h3>
            <input
              type="number"
              placeholder="Ingrese el ID del parte"
              value={deleteParteId}
              onChange={(e) => {
                setDeleteParteId(e.target.value);
                setDeleteError('');
              }}
              required
            />
            <button
              className="confirm-delete-btn"
              onClick={() => setConfirmDelete(true)}
            >
              Eliminar
            </button>
            <button className="close-modal-btn" onClick={() => {
              setIsDeleteModalOpen(false);
              setConfirmDelete(false);
            }}>
              Cancelar
            </button>
          </div>

          {confirmDelete && (
            <div className="confirm-overlay">
              <div className="confirm-content">
                <p>¿Está seguro? Esta acción no se puede deshacer.</p>
                {deleteError && <p className="error-message">{deleteError}</p>}
                <button className="confirm-delete-btn" onClick={handleDelete}>Confirmar</button>
                <button className="close-modal-btn" onClick={() => setConfirmDelete(false)}>
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

export default EmergenciesTable;