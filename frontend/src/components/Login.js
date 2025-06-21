import React, { useState } from 'react';
import api from '../api';
import './Styles/Login.css'; // Asegúrate que Login.css esté actualizado
import { useUsuario } from '../context/UserContext';

function Login({ setIsAuthenticated }) {
  const { setUsuario } = useUsuario();
  const [legajo, setLegajo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', { legajo, password });
      if (response.data.success) {
        const usuario = {
          legajo,
          nombreCompleto: response.data.nombreCompleto,
          primerIngreso: response.data.primerIngreso === 1 || response.data.primerIngreso === true,
          rol: response.data.rol
        };
        setIsAuthenticated(true);
        setUsuario(usuario);
      } else {
        setError('Legajo o contraseña incorrectos.');
      }
    } catch (error) {
      console.error("Error al intentar iniciar sesión:", error);
      setError('Error en el servidor. Inténtelo más tarde.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="Logo" className="login-logo" />
        <h1 className="login-title">SIGB</h1>
        {/* <h2>Inicio de Sesión</h2> */}
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            {/* <label htmlFor="legajo" className="form-label">Legajo</label> */}
            <input
              id="legajo"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Legajo"
              className="form-control" // Clase global
              value={legajo}
              onChange={(e) => setLegajo(e.target.value.replace(/\D/, ""))}
              required
            />
          </div>

          <div className="form-group">
            {/* <label htmlFor="password_login" className="form-label">Contraseña</label> */}
            <div className="password-container"> {/* Mantiene la estructura para el botón de visibilidad */}
              <input
                id="password_login"
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                className="form-control" // Clase global
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="toggle-password-btn"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && <p className="login-error-message">{error}</p>}
          <button type="submit" className="btn btn-primary login-submit-btn">Ingresar al Sistema</button>
        </form>
      </div>
    </div>
  );
}

export default Login;