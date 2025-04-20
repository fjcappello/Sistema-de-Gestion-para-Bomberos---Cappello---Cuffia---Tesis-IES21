import React, { useState, useEffect } from 'react';
import '../Styles/Dashboard.css';

function IngresosEgresosCard({ movimientos = [], onRegistrar }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', apellido: '', dni: '', estado_id: '' });
  const [personal, setPersonal] = useState([]);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => {
    const fetchPersonal = async () => {
      try {
        const response = await fetch('http://localhost:3001/personal_nombres');
        const data = await response.json();
        setPersonal(data);
      } catch (error) {
        console.error('Error al cargar personal:', error);
      }
    };

    fetchPersonal();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectPersona = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    if (id === '') {
      setFormData({ nombre: '', apellido: '', dni: '', estado_id: '' });
    } else {
      const persona = personal.find(p => p.id.toString() === id);
      if (persona) {
        const [nombre, apellido] = persona.nombre_completo.split(' ');
        setFormData({ nombre, apellido, dni: persona.id.toString(), estado_id: '' });
      }
    }
  };

  const handleRegistro = (estado_id) => {
    if (!formData.nombre || !formData.apellido || !formData.dni || !estado_id) {
      alert('Complete todos los campos');
      return;
    }
    onRegistrar({ ...formData, estado_id });
    setFormData({ nombre: '', apellido: '', dni: '', estado_id: '' });
    setSelectedId('');
    setIsModalOpen(false);
  };

  const ultimosMovimientos = movimientos.slice(0, 4);

  return (
    <div className="ingresos-egresos-card">
      <h3>Últimos Movimientos</h3>
      <ul>
        {ultimosMovimientos.map((m, index) => (
          <li key={index}>
            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {m.estado} - {m.nombre} {m.apellido}
          </li>
        ))}
      </ul>
      <button onClick={() => setIsModalOpen(true)}>Registrar Movimiento</button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Registrar Movimiento</h4>
            <select className="persona-select" value={selectedId} onChange={handleSelectPersona}>
              <option value="">Ingreso Manual</option>
              {personal.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre_completo}</option>
              ))}
            </select>
            <br />
            <input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} disabled={!!selectedId} />
            <input name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} disabled={!!selectedId} />
            <input name="dni" placeholder="DNI" value={formData.dni} onChange={handleChange} disabled={!!selectedId} />
            <br />
            <div className="modal-buttons">
              <button onClick={() => handleRegistro(formData.estado_id)}>Registrar</button>
              <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IngresosEgresosCard;
