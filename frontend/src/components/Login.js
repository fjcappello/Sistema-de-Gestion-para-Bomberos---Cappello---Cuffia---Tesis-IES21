import React, { useState } from "react";
import api from "../api";
import "./Styles/Login.css";
import { useUsuario } from "../context/UserContext";

const VisibilityOnIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
  </svg>
);

const VisibilityOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457L14.732 3.5H16v2.5L13.359 11.238zM11.245 14.126A5.99 5.99 0 0 1 8 12.5c-2.12 0-3.879-1.168-5.168-2.457L1.268 14.5H0V12l2.641-2.641a2.422 2.422 0 0 0-.01.01L.64 11.36a1.498 1.498 0 0 0 0 1.06l.707.707a1.498 1.498 0 0 0 1.06 0L4.939 10.64a1.498 1.498 0 0 0 1.06 0l.707-.707a1.498 1.498 0 0 0 0-1.06L5.061 7.36a5.943 5.943 0 0 1-.77.771A5.944 5.944 0 0 1 8 9.5c.535 0 1.048-.083 1.528-.242l.707.707a3.488 3.488 0 0 0-1.09.303A5.99 5.99 0 0 1 8 12.5c-.535 0-1.048.083-1.528.242l-.707-.707a3.488 3.488 0 0 0 1.09-.303zM4.939 4.939L3.36 6.516a1.498 1.498 0 0 0 0 1.06l.707.707a1.498 1.498 0 0 0 1.06 0L6.94 6.36a1.498 1.498 0 0 0 1.06 0l.707-.707a1.498 1.498 0 0 0 0-1.06L6.36 3.061a1.498 1.498 0 0 0-1.06 0l-.707.707a1.498 1.498 0 0 0 0 1.06z" />
    <path d="M12.5 7.5a5 5 0 0 1-5 5 .5.5 0 0 0 0 1 .5.5 0 0 0 0 1 7 7 0 0 0 7-7 .5.5 0 0 0-1 0 .5.5 0 0 0-1 0z" />
  </svg>
);

function Login({ setIsAuthenticated }) {
  const { setUsuario } = useUsuario();
  const [legajo, setLegajo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("/login", { legajo, password });
      if (response.data.success) {
        const usuario = {
          legajo,
          nombreCompleto: response.data.nombreCompleto,
          primerIngreso:
            response.data.primerIngreso === 1 ||
            response.data.primerIngreso === true,
          rol: response.data.rol,
        };
        setIsAuthenticated(true);
        setUsuario(usuario);
      } else {
        setError(response.data.message || "Legajo o contraseña incorrectos.");
      }
    } catch (error) {
      console.error("Error al intentar iniciar sesión:", error);
      setError(
        error.response?.data?.message ||
          "Error en el servidor. Inténtelo más tarde."
      );
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-panel-fluent">
        <img
          src={`${process.env.PUBLIC_URL}/images/logo.png`}
          alt="Logo"
          className="login-logo"
        />
        <h1 className="login-main-title">SIGB</h1>
        <h2 className="login-subtitle">Inicio de Sesión</h2>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group-fluent">
            <label htmlFor="legajo" className="form-label-fluent">
              Legajo
            </label>
            <input
              id="legajo"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="form-control-fluent"
              value={legajo}
              onChange={(e) => setLegajo(e.target.value.replace(/\D/, ""))}
              required
            />
          </div>

          <div className="form-group-fluent">
            <label htmlFor="password_login" className="form-label-fluent">
              Contraseña
            </label>
            <div className="password-container-fluent">
              <input
                id="password_login"
                type={showPassword ? "text" : "password"}
                className="form-control-fluent"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="toggle-password-btn-fluent"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                title={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityOnIcon />}
              </button>
            </div>
          </div>

          {error && <p className="login-error-message">{error}</p>}

          <button
            type="submit"
            className="btn-fluent btn-fluent-primary login-submit-btn"
          >
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
