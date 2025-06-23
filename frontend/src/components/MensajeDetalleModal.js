import React, { useEffect } from "react";
import api from "../api";
// Importar el CSS del modal de EnviarMensaje si tiene estilos comunes o si se crea un MensajeDetalleModal.css
// import "./Styles/EnviarMensajeModal.css"; // O un CSS dedicado si es necesario

// Icono de Cierre (X) simple para el modal (reutilizado)
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
  </svg>
);

function MensajeDetalleModal({ mensaje, onClose, tipo, onLeido }) { // Añadir onLeido para actualizar estado en BandejaEntrada
  useEffect(() => {
    // Marcar como leído solo si es recibido, no está leído y onLeido es una función
    if (mensaje && mensaje.id && tipo === "recibido" && !mensaje.leido && typeof onLeido === 'function') {
      api
        .put(`/mensajes/marcar-leido/${mensaje.id}`)
        .then(() => {
            onLeido(mensaje.id); // Llama al callback para actualizar el estado en BandejaEntrada
        })
        .catch((err) => console.error("Error al marcar como leído:", err));
    }
  }, [mensaje, tipo, onLeido]); // Incluir onLeido en las dependencias

  if (!mensaje) return null;

  // Determinar el remitente/destinatario basado en el tipo de mensaje
  // Asumiendo que 'mensaje.remitente_nombre_completo' y 'mensaje.destinatario_nombre_completo' están disponibles
  const personaLabel = tipo === "recibido" ? "De:" : "Para:";
  const personaNombre = tipo === "recibido"
    ? (mensaje.remitente_nombre_completo || mensaje.remitente_id || "Desconocido")
    : (mensaje.destinatario_nombre_completo || "Varios destinatarios" ); // O lógica para mostrar múltiples

  return (
    <div className="modal-overlay-fluent">
      <div className="modal-window-fluent" style={{maxWidth: '600px'}}> {/* Ventana más ancha para mensajes */}
        <div className="modal-header-fluent">
          <h3 className="modal-title-fluent">{mensaje.asunto || "(Sin Asunto)"}</h3>
          <button
            type="button"
            className="modal-close-btn-fluent"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body-fluent">
          <div style={{ marginBottom: 'var(--spacing-sm)' }}>
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-fluent-text-secondary)' }}>{personaLabel} </span>
            <span style={{ color: 'var(--color-fluent-text-primary)' }}>{personaNombre}</span>
          </div>
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-fluent-text-secondary)' }}>Fecha: </span>
            <span style={{ color: 'var(--color-fluent-text-primary)' }}>
              {new Date(mensaje.fecha_envio).toLocaleString('es-AR', {dateStyle:'medium', timeStyle:'short'})}
            </span>
          </div>

          {/* Cuerpo del mensaje */}
          <div
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              padding: "var(--spacing-md)",
              backgroundColor: "var(--color-fluent-bg)", /* Fondo ligeramente diferente para el cuerpo */
              borderRadius: "var(--border-radius-medium)",
              minHeight: "100px",
              maxHeight: "40vh", // Limitar altura y permitir scroll si es muy largo
              overflowY: "auto",
              border: "1px solid var(--color-fluent-border-light)"
            }}
          >
            {mensaje.cuerpo}
          </div>
        </div>

        <div className="modal-footer-fluent">
          {/* Podría haber un botón de "Responder" aquí en el futuro */}
          <button type="button" className="btn-fluent" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default MensajeDetalleModal;
