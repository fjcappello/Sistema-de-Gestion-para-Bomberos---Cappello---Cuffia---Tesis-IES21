import React, { useState } from 'react';
import api from '../api';
import './Styles/Login.css'; // Estilos Win98
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
        <h1 className="login-main-title">SIGB</h1>
        <h2 className="login-subtitle">Inicio de Sesión</h2>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group-win98"> {/* Clase Win98 */}
            <label htmlFor="legajo" className="form-label-win98">Legajo:</label> {/* Label visible */}
            <input
              id="legajo"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              // placeholder="Legajo" // Placeholder no es muy Win98
              className="form-control-win98" // Clase Win98
              value={legajo}
              onChange={(e) => setLegajo(e.target.value.replace(/\D/, ""))}
              required
            />
          </div>

          <div className="form-group-win98"> {/* Clase Win98 */}
            <label htmlFor="password_login" className="form-label-win98">Contraseña:</label> {/* Label visible */}
            <div className="password-container">
              <input
                id="password_login"
                type={showPassword ? "text" : "password"}
                // placeholder="Contraseña"
                className="form-control-win98" // Clase Win98
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="toggle-password-btn" // Estilizado en Login.css
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} // Tooltip Win98 style
              >
                {/* Usar texto o un caracter simple en lugar de emoji para Win98 */}
                {showPassword ? 'O' : 'V'}
              </button>
            </div>
          </div>

          {error && <p className="login-error-message">{error}</p>}
          {/* Botón con clases Win98 */}
          <button type="submit" className="btn-win98 login-submit-btn">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;