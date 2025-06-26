import React, { useState } from 'react';
import api from '../api';
import './Styles/ModalCambioPassword.css'; // Carga estilos específicos mínimos
// global.css se importa en App.js o index.js

// Verificación de criterios de contraseña segura
const verificarCriterios = (password) => ({
  longitud: password.length >= 6,
  mayuscula: /[A-Z]/.test(password),
  minuscula: /[a-z]/.test(password),
  numero: /[0-9]/.test(password),
});

const calcularFuerza = (criterios) =>
  Object.values(criterios).filter(Boolean).length;

// Icono de Cierre (X) simple para el modal
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
  </svg>
);

const ModalCambioPassword = ({ legajo, onPasswordChanged, closeModal }) => {
  const [currentPassword, setCurrentPassword] = useState(''); // Si se necesita la actual
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Para mensajes de éxito
  const [loading, setLoading] = useState(false);

  const criterios = verificarCriterios(nueva);
  const fuerza = calcularFuerza(criterios);
  const coloresFuerza = ["#ff4d4d", "#ff944d", "#ffdb4d", "#b3ff4d"];

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (nueva !== confirmar) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }
    const criteriosCheck = verificarCriterios(nueva);
    if (calcularFuerza(criteriosCheck) < 4) {
      setError("La contraseña no cumple con todos los requisitos de seguridad.");
      return;
    }

    try {
      setLoading(true);

      const payload = { legajo, nuevaPassword: nueva };

      const { data } = await api.post("/cambiar-password", payload);

      if (data.success) {
        setSuccess("Contraseña actualizada con éxito.");
        setNueva(""); // Limpiar campos
        setConfirmar("");
        setCurrentPassword("");
        if(onPasswordChanged) onPasswordChanged(); // Callback

      } else {
        setError(data.error || data.message || "Error al cambiar la contraseña.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };


  if (!legajo && !closeModal) { 
      console.warn("ModalCambioPassword renderizado sin 'legajo' o 'closeModal' props.");
      return null;
  }


  return (
    <div className="modal-overlay-fluent">
      <div className="modal-window-fluent" style={{ maxWidth: '420px' }}>
        <div className="modal-header-fluent">
          <h3 className="modal-title-fluent">Cambiar Contraseña</h3>


          {closeModal && (
            <button
              type="button"
              className="modal-close-btn-fluent"
              onClick={closeModal}
              aria-label="Cerrar modal"
              disabled={loading}
            >
              <CloseIcon />
            </button>
          )}
        </div>

        <form onSubmit={handleChangePassword}>
          <div className="modal-body-fluent">

            <div className="form-group-fluent">
              <label className="form-label-fluent" htmlFor="nueva_modal_pwd_fluent">Nueva Contraseña:</label>
              <input
                type="password"
                id="nueva_modal_pwd_fluent"
                className="form-control-fluent"
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
                disabled={loading}
                required
                autoFocus
              />
            </div>

            <div className="form-group-fluent">
              <label className="form-label-fluent" htmlFor="confirmar_modal_pwd_fluent">Confirmar Nueva Contraseña:</label>
              <input
                type="password"
                id="confirmar_modal_pwd_fluent"
                className="form-control-fluent"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="barra-fuerza">
              <div
                style={{
                  width: `${(fuerza / 4) * 100}%`,
                  backgroundColor: coloresFuerza[fuerza - 1] || "transparent",
                  height: "8px",
                  borderRadius: "4px",
                  transition: "width 0.3s ease"
                }}
              />
            </div>
            <ul className="criterios-lista">
              <li className={criterios.longitud ? "valido" : ""}>Al menos 6 caracteres</li>
              <li className={criterios.mayuscula ? "valido" : ""}>Al menos una mayúscula</li>
              <li className={criterios.minuscula ? "valido" : ""}>Al menos una minúscula</li>
              <li className={criterios.numero ? "valido" : ""}>Al menos un número</li>
            </ul>

            {error && <p className="modal-cambio-password-error">{error}</p>}
            {success && <p className="modal-cambio-password-success">{success}</p>}
          </div>

          <div className="modal-footer-fluent">
            {closeModal && ( // Mostrar Cancelar solo si se puede cerrar el modal
                 <button type="button" className="btn-fluent" onClick={closeModal} disabled={loading}>
                    Cancelar
                </button>
            )}
            <button type="submit" className="btn-fluent btn-fluent-primary" disabled={loading}>
              {loading ? "Guardando..." : "Aceptar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCambioPassword;
