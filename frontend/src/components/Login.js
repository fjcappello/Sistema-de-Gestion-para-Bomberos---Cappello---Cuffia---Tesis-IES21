import React, { useState } from 'react';
import axios from 'axios';
import './Styles/Login.css';
import { useUsuario } from '../context/UserContext';

function Login({ setIsAuthenticated }) {
  const { setAuthData } = useUsuario();
  const [legajo, setLegajo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', { legajo, password });
      if (response.data.success) {
        const usuario = {
          legajo,
          nombreCompleto: response.data.nombreCompleto,
          primerIngreso: response.data.primerIngreso === 1 || response.data.primerIngreso === true,
          rol: response.data.rol
        };
        setIsAuthenticated(true); // This might become redundant if App.js relies on UserContext.usuario
        setAuthData(usuario, response.data.token);
        // localStorage for 'isAuthenticated' and 'usuario' is now handled in setAuthData
        console.log("Token set in context and window.jwtToken:", response.data.token);
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
      <img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="Logo" className="logo" />
      <h1>SIGB</h1>
      <h2>Inicio de Sesión</h2>
      
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="number"
          placeholder="Legajo"
          value={legajo}
          onChange={(e) => setLegajo(e.target.value)}
          required
        />
        
        <div className="password-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="toggle-password-btn"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-btn">Ingresar al Sistema</button>
      </form>
    </div>
  );
}

export default Login;