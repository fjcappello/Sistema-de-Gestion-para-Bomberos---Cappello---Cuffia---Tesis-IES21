import React, { useEffect } from "react";
import axios from "axios";
import "./Styles/BandejaEntrada.css";

function MensajeDetalleModal({ mensaje, onClose, tipo }) {
  useEffect(() => {
    if (mensaje && mensaje.id && tipo === "recibido") {
      axios
        .put(`http://localhost:3001/mensajes/marcar-leido/${mensaje.id}`)
        .catch((err) => console.error("Error al marcar como leído:", err));
    }
  }, [mensaje, tipo]);

  if (!mensaje) return null;

  const origen = tipo === "recibido" ? mensaje.remitente : mensaje.destinatario;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{mensaje.asunto}</h3>
        <p>
          <strong>{tipo === "recibido" ? "Remitente" : "Destinatario"}:</strong>{" "}
          {origen}
        </p>
        <p>
          <strong>Fecha:</strong>{" "}
          {new Date(mensaje.fecha_envio).toLocaleString()}
        </p>
        <hr />
        <p style={{ whiteSpace: "pre-wrap" }}>{mensaje.cuerpo}</p>
        <button className="close-modal-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default MensajeDetalleModal;
