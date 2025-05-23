// MiCuenta.js
import React, { useState } from "react";
import axios from "axios";
import "./Styles/Configuracion.css"; // Manteniendo el archivo de estilos original

function MiCuenta() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Función para cambiar la contraseña
  const cambiarPassword = async () => {
    if (nueva !== confirmar) {
      setError("Las contraseñas no coinciden.");
      setMensaje("");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/cambiar-password",
        {
          legajo: usuario.legajo,
          nuevaPassword: nueva,
        }
      );

      if (response.data.success) {
        setMensaje("Contraseña actualizada con éxito.");
        setError("");
        setNueva("");
        setConfirmar("");
      } else {
        setError(response.data.error || "No se pudo actualizar la contraseña.");
        setMensaje("");
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
      setMensaje("");
    }
  };

  // Toggle para mostrar/ocultar la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="configuracion-layout">
      <main className="configuracion-contenido">
        <h2>Mi cuenta</h2>
        <h3>Cambiar contraseña</h3>
        <div className="configuracion-filtros">
          <input
            className="input-campo"
            type={showPassword ? "text" : "password"}
            placeholder="Nueva contraseña"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
          />
          <input
            className="input-campo"
            type={showPassword ? "text" : "password"}
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
          />
          <button
            type="button"
            className="nuevo-mensaje-btn"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
          <button className="nuevo-mensaje-btn" onClick={cambiarPassword}>
            Guardar
          </button>
        </div>
        {mensaje && <p className="mensaje-ok">{mensaje}</p>}
        {error && <p className="mensaje-error">{error}</p>}
      </main>
    </div>
  );
}

export default MiCuenta;
