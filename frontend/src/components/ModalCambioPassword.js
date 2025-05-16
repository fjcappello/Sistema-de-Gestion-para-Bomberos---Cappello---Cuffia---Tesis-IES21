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

  return (
    <div className="modal-bg">
      <div className="modal-content dark-mode">
        <h2>Cambio de contraseña</h2>
        <p>
          Es tu primer ingreso. Por favor, cambia tu contraseña para continuar.
        </p>

        <input
          type="password"
          placeholder="Nueva contraseña"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
        />

        {error && <p className="error">{error}</p>}
        <button onClick={handleChangePassword} disabled={loading}>
          {loading ? "Guardando..." : "Aceptar"}
        </button>
      </div>
    </div>
  );
};

export default ModalCambioPassword;
