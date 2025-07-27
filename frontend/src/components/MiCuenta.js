// MiCuenta.js
import React, { useState, useEffect } from "react";
import api from "../api";
import { useUsuario } from "../context/UserContext";
import "./Styles/Configuracion.css"; 

// Iconos SVG simples para visibilidad de contraseña
const VisibilityOnIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
  </svg>
);

const VisibilityOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457L14.732 3.5H16v2.5L13.359 11.238zM11.245 14.126A5.99 5.99 0 0 1 8 12.5c-2.12 0-3.879-1.168-5.168-2.457L1.268 14.5H0V12l2.641-2.641a2.422 2.422 0 0 0-.01.01L.64 11.36a1.498 1.498 0 0 0 0 1.06l.707.707a1.498 1.498 0 0 0 1.06 0L4.939 10.64a1.498 1.498 0 0 0 1.06 0l.707-.707a1.498 1.498 0 0 0 0-1.06L5.061 7.36a5.943 5.943 0 0 1-.77.771A5.944 5.944 0 0 1 8 9.5c.535 0 1.048-.083 1.528-.242l.707.707a3.488 3.488 0 0 0-1.09.303A5.99 5.99 0 0 1 8 12.5c-.535 0-1.048.083-1.528.242l-.707-.707a3.488 3.488 0 0 0 1.09-.303zM4.939 4.939L3.36 6.516a1.498 1.498 0 0 0 0 1.06l.707.707a1.498 1.498 0 0 0 1.06 0L6.94 6.36a1.498 1.498 0 0 0 1.06 0l.707-.707a1.498 1.498 0 0 0 0-1.06L6.36 3.061a1.498 1.498 0 0 0-1.06 0l-.707.707a1.498 1.498 0 0 0 0 1.06z"/>
    <path d="M12.5 7.5a5 5 0 0 1-5 5 .5.5 0 0 0 0 1 .5.5 0 0 0 0 1 7 7 0 0 0 7-7 .5.5 0 0 0-1 0 .5.5 0 0 0-1 0z"/>
  </svg>
);

function MiCuenta() {
  const { usuario } = useUsuario();
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [emailRegistrado, setEmailRegistrado] = useState("");

  const cargarDatos = async () => {
    try {
      const res = await api.get(`/personal/notificaciones/${usuario.legajo}`);
      setEmail(res.data.email || "");
      setEmailRegistrado(res.data.email || "");
    } catch (err) {
      console.error("Error al cargar datos del usuario:", err);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [usuario]);

  const guardarNotificaciones = async () => {
    try {
      await api.put(`/personal/notificaciones/${usuario.legajo}`, {
        email,
      });
      alert("✅ Preferencias actualizadas correctamente.");
      cargarDatos();
    } catch (err) {
      console.error("Error al actualizar preferencias:", err);
      alert("❌ No se pudieron guardar los cambios.");
    }
  };

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
        <h2 className="table-title">Mi cuenta</h2>
        <p>Cambiar contraseña</p>
        <div className="configuracion-filtros">
          <div className="password-container-fluent">
            <input
              className="form-control-fluent"
              type={showPassword ? "text" : "password"}
              placeholder="Nueva contraseña"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
            />
            <button
              type="button"
              className="toggle-password-btn-fluent"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <VisibilityOffIcon /> : <VisibilityOnIcon />}
            </button>
          </div>
          <div className="password-container-fluent">
            <input
              className="form-control-fluent"
              type={showPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
            />
          </div>
          <button className="add-report-btn" onClick={cambiarPassword}>
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

        <hr style={{ margin: "2rem 0" }} />
        <h3>Preferencias de notificación</h3>
        <div className="configuracion-filtros">
          <input
            type="email"
            className="form-control-fluent"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="add-report-btn" onClick={guardarNotificaciones}>
            Guardar preferencias
          </button>
          {emailRegistrado && emailRegistrado.trim() !== "" ? (
            <>
              <p style={{ fontStyle: "italic", color: "#555" }}>
                📧 Mail registrado: <strong>{emailRegistrado}</strong>, las notificaciones se encuentran activadas.
              </p>
              <button
                className="add-report-btn"
                style={{ backgroundColor: "#999", marginTop: "0.5rem" }}
                onClick={async () => {
                  const confirmar = window.confirm("¿Estás seguro de que deseas desactivar las notificaciones?");
                  if (!confirmar) return;

                  await api.put(`/personal/notificaciones/${usuario.legajo}`, {
                    email: "",
                  });
                  alert("✅ Notificaciones desactivadas correctamente.");
                  cargarDatos();
                }}
              >
                Desactivar notificaciones
              </button>
            </>
          ) : (
            <p style={{ fontStyle: "italic", color: "#555" }}>
              📧 Ningún mail registrado, las notificaciones se encuentran desactivadas.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default MiCuenta;
