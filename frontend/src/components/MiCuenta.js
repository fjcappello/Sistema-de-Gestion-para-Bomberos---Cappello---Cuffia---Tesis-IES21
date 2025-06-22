// MiCuenta.js
import React, { useState } from "react";
import api from "../api";
import { useUsuario } from "../context/UserContext";
import "./Styles/Configuracion.css"; // Manteniendo el archivo de estilos original

function MiCuenta() {
  const { usuario } = useUsuario();
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Función para verificar criterios de contraseña segura
  const verificarCriterios = (password) => {
    return {
      longitud: password.length >= 6,
      mayuscula: /[A-Z]/.test(password),
      minuscula: /[a-z]/.test(password),
      numero: /[0-9]/.test(password),
    };
  };

  // Calcular fuerza de la contraseña (0 a 4)
  const calcularFuerza = (criterios) => {
    return Object.values(criterios).filter(Boolean).length;
  };

  // Función para cambiar la contraseña
  const cambiarPassword = async () => {
    const criterios = verificarCriterios(nueva);
    if (nueva !== confirmar) {
      setError("Las contraseñas no coinciden.");
      setMensaje("");
      return;
    }
    if (calcularFuerza(criterios) < 4) {
      setError("La contraseña no cumple con todos los requisitos de seguridad.");
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
      console.error("Error al cambiar contraseña:", err);
      setError("Error al conectar con el servidor.");
      setMensaje("");
    }
  };

  // Toggle para mostrar/ocultar la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const criterios = verificarCriterios(nueva);
  const fuerza = calcularFuerza(criterios);
  const coloresFuerza = ["#ff4d4d", "#ff944d", "#ffdb4d", "#b3ff4d"];

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
        <div className="barra-fuerza">
          <div
            style={{
              width: `${(fuerza / 4) * 100}%`,
              backgroundColor: coloresFuerza[fuerza - 1] || "transparent",
              transition: "width 0.3s ease",
            }}
          />
        </div>
        <ul className="criterios-lista">
          <li className={criterios.longitud ? "valido" : ""}>
            Al menos 6 caracteres
          </li>
          <li className={criterios.mayuscula ? "valido" : ""}>
            Al menos una mayúscula
          </li>
          <li className={criterios.minuscula ? "valido" : ""}>
            Al menos una minúscula
          </li>
          <li className={criterios.numero ? "valido" : ""}>
            Al menos un número
          </li>
        </ul>
        {mensaje && <p className="mensaje-ok">{mensaje}</p>}
        {error && <p className="mensaje-error">{error}</p>}
      </main>
    </div>
  );
}

export default MiCuenta;
