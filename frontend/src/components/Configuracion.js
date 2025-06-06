import React, { useState } from "react";
import api from "../api";
import "./Styles/Configuracion.css";

function CambioPassword() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const cambiarPassword = async () => {
    if (nueva !== confirmar) {
      setError("Las contraseñas no coinciden.");
      setMensaje("");
      return;
    }

    try {
      const response = await api.post("/cambiar-password", {
        legajo: usuario.legajo,
        nuevaPassword: nueva,
      });

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <h2>Cambiar contraseña</h2>
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
    </>
  );
}

export default CambioPassword;
