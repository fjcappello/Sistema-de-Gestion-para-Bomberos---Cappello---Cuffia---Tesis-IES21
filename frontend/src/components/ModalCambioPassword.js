import React, { useState } from 'react';
import api from '../api';
import './Styles/ModalCambioPassword.css'; // Carga estilos específicos mínimos
// global.css se importa en App.js o index.js

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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (nueva !== confirmar) {
      setError("Las nuevas contraseñas no coinciden.");
      return;
    }
    if (nueva.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      // Asumiendo que el endpoint es el mismo y que la contraseña actual NO es necesaria
      // para este flujo específico de "primer ingreso" o "cambio obligatorio".
      // Si se necesitara la contraseña actual, se añadiría al payload.
      const payload = { legajo, nuevaPassword: nueva };
    //   if(currentPassword){ // Opcional: enviar contraseña actual si el input está presente y lleno
    //       // payload.currentPassword = currentPassword;
    //   }

      const { data } = await api.post("/cambiar-password", payload);

      if (data.success) {
        setSuccess("Contraseña actualizada con éxito.");
        setNueva(""); // Limpiar campos
        setConfirmar("");
        setCurrentPassword("");
        if(onPasswordChanged) onPasswordChanged(); // Callback
        // Considerar cerrar el modal automáticamente o dejar que el usuario lo haga
        // setTimeout(closeModal, 2000);
      } else {
        setError(data.error || data.message || "Error al cambiar la contraseña.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Propslegajo es necesario para este modal
  if (!legajo && !closeModal) { // Si no hay legajo y no hay forma de cerrar, no renderizar para evitar un modal "muerto"
      console.warn("ModalCambioPassword renderizado sin 'legajo' o 'closeModal' props.");
      return null;
  }


  return (
    <div className="modal-overlay-fluent">
      <div className="modal-window-fluent" style={{ maxWidth: '420px' }}>
        <div className="modal-header-fluent">
          <h3 className="modal-title-fluent">Cambiar Contraseña</h3>
          {/* Solo mostrar botón de cerrar si la prop closeModal está definida */}
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
            {/* Si este modal es SOLO para primer ingreso, el mensaje es útil */}
            {/* <p style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-fluent-text-secondary)' }}>
              Es tu primer ingreso o se requiere un cambio de contraseña.
            </p> */}

            {/* Opcional: Input para contraseña actual si el flujo lo requiere */}
            {/* <div className="form-group-fluent">
              <label className="form-label-fluent" htmlFor="currentPassword_modal_fluent">Contraseña Actual:</label>
              <input
                type="password"
                id="currentPassword_modal_fluent"
                className="form-control-fluent"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                // required // Solo si es mandatorio
              />
            </div> */}

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
