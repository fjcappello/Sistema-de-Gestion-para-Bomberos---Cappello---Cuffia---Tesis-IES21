import React, { useState } from "react";
import "../components/Styles/ModalCambioPassword.css";

const ModalCambioPassword = ({ legajo, onPasswordChanged }) => {
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (nueva !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3001/cambiar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legajo, nuevaPassword: nueva }),
      });

      const data = await response.json();

      if (data.success) {
        onPasswordChanged();
      } else {
        setError(data.error || "Error al cambiar la contraseña");
      }
    } catch (err) {
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Assuming onClose would be passed as a prop if overlay click-to-close is desired
  // For now, adding it as per instruction, but it might not be functional without parent change
  const handleOverlayClick = () => {
    // Check if onPasswordChanged is meant to also close, or if an onClose prop should be added
    // If this modal is only closed by onPasswordChanged, then overlay click shouldn't do anything
    // For now, let's assume onPasswordChanged implies success and closure.
    // A dedicated onClose would be better.
    // onPasswordChanged(); // This might be wrong if it's only for success
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content cambio-password-modal-content dark-mode" onClick={(e) => e.stopPropagation()}>
        <h2>Cambio de contraseña</h2>
        {/* It might be better to have a dedicated title style in CSS if not using global h3 from modal-content h3 */}
        <p style={{textAlign: 'center', marginBottom: 'var(--spacing-md)'}}>
          Es tu primer ingreso. Por favor, cambia tu contraseña para continuar.
        </p>

        {/* Wrap inputs in a form-container for consistent spacing if needed */}
        <div className="form-container">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            required // Added required for basic validation
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required // Added required
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        {/* Wrap button in a modal-buttons container for consistent layout if there were multiple buttons */}
        <div className="modal-buttons" style={{justifyContent: 'center'}}>
          <button
            className="btn btn-primary"
            onClick={handleChangePassword}
            disabled={loading}
            style={{width: '100%', maxWidth: '200px'}} // Example width control
          >
            {loading ? "Guardando..." : "Aceptar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCambioPassword;
