import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Styles/EmergenciesTable.css';
import PDFGenerator from './PDFGenerator';

const ITEMS_PER_PAGE = 5;

function EmergenciesTable() {
  const [emergencies, setEmergencies] = useState([]);
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [jefesDotacion, setJefesDotacion] = useState([]);
  const [tipoAsistenciaOptions, setTipoAsistenciaOptions] = useState([]);
  const [filters, setFilters] = useState({ jefeDotacion: '', tipoAsistencia: '', startDate: '', endDate: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState(null);

  // Estados adicionales para modales de agregar y eliminar
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteParteId, setDeleteParteId] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [formData, setFormData] = useState({
    nombre_denunciante: '',
    apellido_denunciante: '',
    documento_denunciante: '',
    direccion: '',
    tipo_asistencia: '',
    jefe_dotacion: '',
    parte_escrito: '',
    fecha: '',
  });

  useEffect(() => {
    fetchEmergencies();
    fetchJefesDotacion();
    fetchTipoAsistencia();
  }, []);

  const fetchEmergencies = async () => {
    try {
      const response = await axios.get('http://localhost:3001/partesemergencias', { params: filters });
      setEmergencies(response.data);
      setFilteredEmergencies(response.data);
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

  const fetchTipoAsistencia = async () => {
    try {
      const response = await axios.get('http://localhost:3001/tipos_asistencia');
      setTipoAsistenciaOptions(response.data);
    } catch (error) {
      console.error("Error al obtener tipos de asistencia:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleFilterApply = () => {
    fetchEmergencies();
  };

  const handleSearch = () => {
    const filtered = emergencies.filter(emergencia =>
      emergencia.nombre_denunciante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emergencia.apellido_denunciante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emergencia.tipo_asistencia.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEmergencies(filtered);
  };

  const handleGeneratePDF = (partData) => {
    setSelectedPart(partData);
    setIsPDFModalOpen(true);
  };

  const closePDFModal = () => {
    setIsPDFModalOpen(false);
    setSelectedPart(null);
  };

  // Funciones para agregar y eliminar reportes
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/partesemergencias', formData);
      if (response.data.success) {
        alert("Reporte agregado correctamente");
        setIsAddModalOpen(false);
        setFormData({
          nombre_denunciante: '',
          apellido_denunciante: '',
          documento_denunciante: '',
          direccion: '',
          tipo_asistencia: '',
          jefe_dotacion: '',
          parte_escrito: '',
          fecha: '',
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
        setDeleteError("Error al eliminar el reporte.");
      }
    } catch (error) {
      console.error("Error al intentar eliminar el reporte:", error);
      setDeleteError("Error en el servidor.");
    }
  };

  const totalPages = Math.ceil(filteredEmergencies.length / ITEMS_PER_PAGE);
  const currentEmergencies = filteredEmergencies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="table-container">
      <h2 className="table-title">Registro de Emergencias</h2>

      {/* Filtros y Buscador */}
      <div className="filter-container">
        <select name="tipoAsistencia" value={filters.tipoAsistencia} onChange={handleFilterChange} className="filter-select">
          <option value="">Tipo de Asistencia</option>
          {tipoAsistenciaOptions.map((tipo) => (
            <option key={tipo} value={tipo}>{tipo}</option>
          ))}
        </select>
        
        <select name="jefeDotacion" value={filters.jefeDotacion} onChange={handleFilterChange} className="filter-select">
          <option value="">Jefe de Dotación</option>
          {jefesDotacion.map((jefe) => (
            <option key={jefe.id} value={jefe.id}>{jefe.nombre_completo}</option>
          ))}
        </select>
        
        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="filter-input" />
        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="filter-input" />
        
        <button onClick={handleFilterApply} className="filter-btn">Filtrar</button>

        <input
          type="text"
          placeholder="Buscar por nombre, apellido o tipo de asistencia"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-btn">Buscar</button>
      </div>

      {/* Tabla de Emergencias */}
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
            <th>Acciones</th>
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
                <td>
                  <button onClick={() => handleGeneratePDF(emergencia)} className="generate-pdf-btn">Generar PDF</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" style={{ textAlign: 'center', padding: '1rem', color: '#555' }}>No hay emergencias cargadas</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Anterior</button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente</button>
      </div>

      <button className="add-report-btn" onClick={() => setIsAddModalOpen(true)}>Agregar Nuevo Reporte</button>
      <button className="delete-report-btn" onClick={() => setIsDeleteModalOpen(true)}>Eliminar Reporte</button>

      {/* Modal para Agregar Reporte */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Agregar Nuevo Reporte</h3>
            <form onSubmit={handleAddSubmit} className="form-container">
              <input type="text" name="nombre_denunciante" placeholder="Nombre del denunciante" value={formData.nombre_denunciante} onChange={(e) => setFormData({ ...formData, nombre_denunciante: e.target.value })} required />
              <input type="text" name="apellido_denunciante" placeholder="Apellido del denunciante" value={formData.apellido_denunciante} onChange={(e) => setFormData({ ...formData, apellido_denunciante: e.target.value })} required />
              <input type="number" name="documento_denunciante" placeholder="Documento del denunciante" value={formData.documento_denunciante} onChange={(e) => setFormData({ ...formData, documento_denunciante: e.target.value })} required />
              <input type="text" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} required />
              <input type="text" name="tipo_asistencia" placeholder="Tipo de Asistencia" value={formData.tipo_asistencia} onChange={(e) => setFormData({ ...formData, tipo_asistencia: e.target.value })} required />
              <select name="jefe_dotacion" value={formData.jefe_dotacion} onChange={(e) => setFormData({ ...formData, jefe_dotacion: e.target.value })} required>
                <option value="">Seleccione Jefe de Dotación</option>
                {jefesDotacion.map((jefe) => (
                  <option key={jefe.id} value={jefe.id}>{jefe.nombre_completo}</option>
                ))}
              </select>
              <textarea name="parte_escrito" placeholder="Información adicional" value={formData.parte_escrito} onChange={(e) => setFormData({ ...formData, parte_escrito: e.target.value })} required />
              <label>Fecha de intervención:</label>
              <input type="date" name="fecha" value={formData.fecha} onChange={(e) => setFormData({ ...formData, fecha: e.target.value })} required />
              <button type="submit" className="submit-btn">Agregar Reporte</button>
            </form>
            <button className="close-modal-btn" onClick={() => setIsAddModalOpen(false)}>Cerrar</button>
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
              placeholder="Ingrese el ID del parte"
              value={deleteParteId}
              onChange={(e) => setDeleteParteId(e.target.value)}
              required
            />
            <button className="confirm-delete-btn" onClick={handleDelete}>Eliminar</button>
            <button className="close-modal-btn" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
            {deleteError && <p className="error-message">{deleteError}</p>}
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