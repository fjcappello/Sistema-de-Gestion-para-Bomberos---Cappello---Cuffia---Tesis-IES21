import React, { useState } from 'react';
import api from '../api';
import './Styles/Login.css';
import { useUsuario } from '../context/UserContext';

function Login({ setIsAuthenticated }) {
  const { setUsuario } = useUsuario();
  const [legajo, setLegajo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Enviando datos de login:", { legajo, password });
    try {
      const response = await api.post('/login', { legajo, password });
      console.log("Respuesta del servidor:", response);
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
      <img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="Logo" className="logo" />
      <h1>SIGB</h1>
      <h2>Inicio de Sesión</h2>
      
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Legajo"
          value={legajo}
          onChange={(e) => setLegajo(e.target.value.replace(/\D/, ""))}
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