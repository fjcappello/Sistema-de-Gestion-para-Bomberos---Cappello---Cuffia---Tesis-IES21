import React, { useEffect, useState } from 'react';
import axios from 'axios';

function EnviarMensaje() {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    remitente_id: '', // Esto deberías setearlo desde el login (ej: localStorage)
    asunto: '',
    cuerpo: ''
  });
  const [destinatarios, setDestinatarios] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/personal-nombres')
      .then((res) => setUsuarios(res.data))
      .catch((err) => console.error('Error al obtener usuarios', err));

    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      const { legajo } = JSON.parse(usuarioGuardado);
      setFormData(prev => ({ ...prev, remitente_id: legajo }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddDestinatario = (e) => {
    if (e.key === 'Enter' && e.target.value) {
      setDestinatarios([...destinatarios, e.target.value]);
      e.target.value = '';
    }
  };

  const handleRemoveDestinatario = (destinatario) => {
    setDestinatarios(destinatarios.filter(d => d !== destinatario));
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    try {
      const finalFormData = {
        ...formData,
        destinatarios
      };
      await axios.post('http://localhost:3001/mensajes', finalFormData);
      alert('Mensaje enviado');
      setFormData(prev => ({
        ...prev,
        asunto: '',
        cuerpo: ''
      }));
      setDestinatarios([]);
    } catch (error) {
      console.error('Error al enviar mensaje', error);
    }
  };

  return (
    <div>
      <h2>Enviar Mensaje</h2>
      <form onSubmit={handleEnviar}>
        <input
          type="text"
          placeholder="Agregar destinatario y presionar Enter"
          onKeyDown={handleAddDestinatario}
        />
        <div>
          {destinatarios.map((destinatario, index) => (
            <span key={index}>
              {destinatario} <button type="button" onClick={() => handleRemoveDestinatario(destinatario)}>x</button>
            </span>
          ))}
        </div>
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