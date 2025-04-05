import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Styles/BandejaEntrada.css';

function EnviarMensajeModal({ onClose, onSent }) {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    remitente_id: localStorage.getItem('legajo') || '',
    destinatario_id: '',
    asunto: '',
    cuerpo: ''
  });

  useEffect(() => {
    axios.get('http://localhost:3001/personal_nombres')
      .then((res) => {
        console.log('Usuarios recibidos:', res.data);
        setUsuarios(res.data);
      })
      .catch((err) => console.error('Error al obtener usuarios', err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/mensajes/enviar', formData);
      alert('✅ Mensaje enviado correctamente.');
      onSent();
      onClose();
    } catch (error) {
      console.error('Error al enviar mensaje', error);
      alert('❌ Hubo un error al enviar el mensaje. Intente nuevamente.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Nuevo Mensaje</h3>
        <form onSubmit={handleEnviar} className="form-container">
          <select
            name="destinatario_id"
            value={formData.destinatario_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione destinatario</option>
            {usuarios.length === 0 ? (
              <option disabled value="">(sin usuarios disponibles)</option>
            ) : (
              [...usuarios]
                .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo))
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre_completo}
                  </option>
                ))
            )}
          </select>
          <input
            type="text"
            name="asunto"
            placeholder="Asunto"
            value={formData.asunto}
            onChange={handleChange}
            required
          />
          <textarea
            name="cuerpo"
            placeholder="Mensaje"
            value={formData.cuerpo}
            onChange={handleChange}
            required
          />
          <button type="submit" className="submit-btn">Enviar</button>
          <button type="button" className="close-modal-btn" onClick={onClose}>Cancelar</button>
        </form>
      </div>
    </div>
  );
}

export default EnviarMensajeModal;