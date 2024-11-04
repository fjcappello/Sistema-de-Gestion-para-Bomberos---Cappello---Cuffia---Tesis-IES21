import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PersonalTable.css';

const ITEMS_PER_PAGE = 5;

function PersonalTable() {
  const [personal, setPersonal] = useState([]);
  const [jerarquias, setJerarquias] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    legajo: '',
    nombre: '',
    apellido: '',
    documento: '',
    nacimiento: '',
    fecha_ingreso: '',
    jerarquia_id: ''
  });
  const [deleteLegajo, setDeleteLegajo] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fetchPersonal = async () => {
    try {
      const response = await axios.get('http://localhost:3001/personal');
      setPersonal(response.data);
    } catch (error) {
      console.error("Error al obtener datos de personal:", error);
    }
  };

  const fetchJerarquias = async () => {
    try {
      const response = await axios.get('http://localhost:3001/jerarquias');
      setJerarquias(response.data);
    } catch (error) {
      console.error("Error al obtener jerarquías:", error);
    }
  };

  useEffect(() => {
    fetchPersonal();
    fetchJerarquias();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // Validación del campo Legajo
    const legajoVal = parseInt(formData.legajo, 10);
    if (isNaN(legajoVal) || legajoVal <= 0) {
      alert("El legajo debe ser un número positivo mayor a 0.");
      return;
    }

    // Validación del campo Documento
    const documentoVal = parseInt(formData.documento, 10);
    if (isNaN(documentoVal) || documentoVal < 1 || documentoVal > 99999999) {
      alert("El documento debe ser un número entre 1 y 99,999,999.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/personal', formData);
      if (response.data.success) {
        alert("Personal agregado correctamente");
        setIsAddModalOpen(false);
        clearFormData(); // Limpiar formulario después de agregar
        fetchPersonal(); // Actualizar la lista de personal
      } else {
        alert("Error al agregar personal: " + (response.data.error || "Operación fallida"));
      }
    } catch (error) {
      console.error("Error al intentar agregar personal:", error);
      alert("Error en el servidor al intentar agregar personal. Verifique la conexión.");
    }
  };

  const handleDelete = async () => {
    if (!deleteLegajo) {
      setDeleteError("Por favor, ingrese un número de legajo válido.");
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:3001/personal/${deleteLegajo}`);
      if (response.data.success) {
        alert("Personal eliminado correctamente");
        setIsDeleteModalOpen(false);
        setDeleteLegajo('');
        setDeleteError('');
        fetchPersonal(); // Actualizar la lista de personal
      } else {
        setDeleteError("Error al eliminar personal: " + (response.data.error || "Operación fallida"));
      }
    } catch (error) {
      console.error("Error al intentar eliminar personal:", error);
      setDeleteError("Error en el servidor al intentar eliminar personal. Verifique la conexión.");
    }
  };

  const clearFormData = () => {
    setFormData({
      legajo: '',
      nombre: '',
      apellido: '',
      documento: '',
      nacimiento: '',
      fecha_ingreso: '',
      jerarquia_id: ''
    });
  };

  const openAddModal = () => {
    clearFormData(); // Limpiar datos al abrir el modal
    setIsAddModalOpen(true);
  };

  const totalPages = Math.ceil(personal.length / ITEMS_PER_PAGE);
  const currentPersonal = personal.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="table-container">
      <table className="personal-table">
        <thead>
          <tr>
            <th>Legajo</th>
            <th>Nombre y Apellido</th>
            <th>Documento</th>
            <th>Fecha de nacimiento</th>
            <th>Fecha de ingreso</th>
            <th>Jerarquía</th>
          </tr>
        </thead>
        <tbody>
          {currentPersonal.length > 0 ? (
            currentPersonal.map((rrhh) => (
              <tr key={rrhh.legajo}>
                <td>{rrhh.legajo}</td>
                <td>{rrhh.nombre_completo}</td>
                <td>{rrhh.documento}</td>
                <td>{rrhh.nacimiento}</td>
                <td>{rrhh.fecha_ingreso}</td>
                <td>{rrhh.jerarquia}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No hay datos de personal disponibles</td>
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

      <button className="add-person-btn" onClick={openAddModal}>
        Agregar Nuevo Personal
      </button>
      <button className="delete-person-btn" onClick={() => setIsDeleteModalOpen(true)}>
        Eliminar Personal
      </button>

      {/* Modal para agregar personal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Agregar Nuevo Personal</h3>
            <form onSubmit={handleAddSubmit} className="form-container">
  <input
    type="number"
    name="legajo"
    placeholder="Legajo"
    value={formData.legajo}
    onChange={handleInputChange}
    required
    min="1"
  />
  <input
    type="text"
    name="nombre"
    placeholder="Nombre"
    value={formData.nombre}
    onChange={handleInputChange}
    required
  />
  <input
    type="text"
    name="apellido"
    placeholder="Apellido"
    value={formData.apellido}
    onChange={handleInputChange}
    required
  />
  <input
    type="number"
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
    name="nacimiento"
    value={formData.nacimiento}
    onChange={handleInputChange}
    required
  />
  <label>Fecha de Ingreso:</label>
  <input
    type="date"
    name="fecha_ingreso"
    value={formData.fecha_ingreso}
    onChange={handleInputChange}
    required
  />
  <label>Jerarquía:</label>
  <select
    name="jerarquia_id"
    value={formData.jerarquia_id}
    onChange={handleInputChange}
    required
  >
    <option value="">Seleccione Jerarquía</option>
    {jerarquias.map((j) => (
      <option key={j.id} value={j.id}>
        {j.jerarquia}
      </option>
    ))}
  </select>
  <button type="submit" className="submit-btn">Agregar Personal</button>
</form>
            <button className="close-modal-btn" onClick={() => setIsAddModalOpen(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Modal para eliminar personal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Eliminar Personal</h3>
            <input
              type="text"
              placeholder="Ingrese el legajo"
              value={deleteLegajo}
              onChange={(e) => {
                setDeleteLegajo(e.target.value);
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
            <button className="close-modal-btn" onClick={() => setIsDeleteModalOpen(false)}>
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

export default PersonalTable;