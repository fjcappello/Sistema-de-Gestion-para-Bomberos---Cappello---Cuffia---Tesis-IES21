import React, { useState } from 'react';
import api from '../api'; // Ajustar ruta si es necesario
import './Styles/ModalCambioPassword.css'; // Carga los estilos específicos (ahora mínimos)
// Asegurarse que global.css (con estilos Win98) esté importado globalmente

const ModalCambioPassword = ({ legajo, onPasswordChanged, closeModal }) => { // Añadir closeModal si se quiere botón X
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    // Si es un form, prevenir default
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }

    setError(""); // Limpiar errores previos
    if (nueva !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (nueva.length < 6) { // Ejemplo de validación simple
        setError('La nueva contraseña debe tener al menos 6 caracteres.');
        return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/cambiar-password", { // Endpoint a verificar
        legajo,
        nuevaPassword: nueva,
      });

      if (data.success) {
        // onPasswordChanged podría cerrar el modal y/o mostrar un mensaje de éxito global
        onPasswordChanged();
      } else {
        setError(data.error || data.message || "Error al cambiar la contraseña.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Este modal parece ser para primer ingreso, así que siempre se muestra si el componente padre lo renderiza.
  // No necesita la verificación de `!legajo` aquí si el padre ya lo maneja.

  return (
    <div className="modal-overlay-win98">
      <div className="modal-window-win98" style={{ minWidth: '320px', maxWidth: '400px' }}>
        <div className="modal-title-bar-win98">
          <span className="modal-title-win98">Cambio de Contraseña Obligatorio</span>
          {/* El botón de cerrar podría no ser apropiado si es un cambio obligatorio */}
          {/* Si se permite cerrar, se debe manejar la lógica de qué sucede */}
          {closeModal && ( // Solo mostrar si se pasa la prop closeModal
            <div className="modal-title-buttons-win98">
                <button
                type="button"
                className="modal-title-button-win98"
                onClick={closeModal}
                title="Cerrar"
                disabled={loading}
                >
                <span className="modal-close-btn-symbol"></span>
                </button>
            </div>
          )}
        </div>

        {/* Usar form para el onSubmit y mejor semántica */}
        <form onSubmit={handleChangePassword}>
          <div className="modal-body-win98">
            <p style={{ marginBottom: '10px' }}>
              Es tu primer ingreso. Por favor, cambia tu contraseña para continuar.
            </p>

            <div className="form-group-win98">
              <label className="form-label-win98" htmlFor="nueva_modal_pwd">Nueva Contraseña:</label>
              <input
                type="password"
                id="nueva_modal_pwd"
                className="form-control-win98"
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group-win98">
              <label className="form-label-win98" htmlFor="confirmar_modal_pwd">Confirmar Contraseña:</label>
              <input
                type="password"
                id="confirmar_modal_pwd"
                className="form-control-win98"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {error && <p className="modal-cambio-password-error">{error}</p>}
          </div>

          <div className="modal-footer-win98">
            <button type="submit" className="btn-win98" disabled={loading}>
              {loading ? "Guardando..." : "Aceptar"}
            </button>
            {/* No hay botón de cancelar si es obligatorio, a menos que closeModal tenga otra lógica */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCambioPassword;
