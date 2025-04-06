import React, { useState } from 'react';
import axios from 'axios';
import './Styles/Configuracion.css';

function Configuracion() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const cambiarPassword = async () => {
    if (nueva !== confirmar) {
      setError('Las contraseñas no coinciden.');
      setMensaje('');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/cambiar-password', {
        legajo: usuario.legajo,
        nuevaPassword: nueva
      });

      if (response.data.success) {
        setMensaje('Contraseña actualizada con éxito.');
        setError('');
        setNueva('');
        setConfirmar('');
      } else {
        setError(response.data.error || 'No se pudo actualizar la contraseña.');
        setMensaje('');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
      setMensaje('');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="configuracion-container">
      <h2>Configuración</h2>
      <div className="configuracion-form">
        <label>Nueva contraseña</label>
        <div className="password-container">
          <input
            className="input-campo"
            type={showPassword ? "text" : "password"}
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="toggle-password-btn"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <label>Confirmar contraseña</label>
        <div className="password-container">
          <input
            className="input-campo"
            type={showPassword ? "text" : "password"}
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="toggle-password-btn"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {mensaje && <p className="mensaje-ok">{mensaje}</p>}
        {error && <p className="mensaje-error">{error}</p>}

        <button className="submit-btn" onClick={cambiarPassword}>Guardar</button>
      </div>
    </div>
  );
}

export default Configuracion;
