import React, { useEffect, useState } from 'react';
import axios from 'axios';

function EnviarMensaje() {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    remitente_id: '', // Esto deberías setearlo desde el login (ej: localStorage)
    destinatario_id: '',
    asunto: '',
    cuerpo: ''
  });

  useEffect(() => {
    axios.get('http://localhost:3001/personal-nombres')
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error('Error al obtener usuarios', err));

    const legajoGuardado = localStorage.getItem('legajo');
    if (legajoGuardado) {
      setFormData(prev => ({ ...prev, remitente_id: legajoGuardado }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/mensajes', formData);
      alert('Mensaje enviado');
      setFormData(prev => ({
        ...prev,
        destinatario_id: '',
        asunto: '',
        cuerpo: ''
      }));
    } catch (error) {
      console.error('Error al enviar mensaje', error);
    }
  };

  return (
    <div>
      <h2>Enviar Mensaje</h2>
      <form onSubmit={handleEnviar}>
        <select
          name="destinatario_id"
          value={formData.destinatario_id}
          onChange={handleChange}
          required
        >
          <option value="">Seleccionar destinatario</option>
          {usuarios.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre_completo}
            </option>
          ))}
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
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default EnviarMensaje;