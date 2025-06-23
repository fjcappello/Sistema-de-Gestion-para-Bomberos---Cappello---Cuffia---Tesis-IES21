import React, { useState, useEffect, useRef } from "react";
import api from "../api";
// Ya no se importa BandejaEntrada.css aquí
import "./Styles/EnviarMensajeModal.css"; // Estilos Fluent para este modal

// Icono de Cierre (X) simple para el modal
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
  </svg>
);

function EnviarMensajeModal({ onClose, onSent }) {
  const [usuarios, setUsuarios] = useState([]);
  const [destinatarios, setDestinatarios] = useState([]); // Array de objetos {id, nombre, apellido, legajo}
  const [inputDestinatario, setInputDestinatario] = useState("");
  const usuarioGuardado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const inputDestinatarioRef = useRef(null);


  const [formData, setFormData] = useState({
    remitente_id: usuarioGuardado.legajo || "",
    asunto: "",
    cuerpo: "",
  });
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);


  useEffect(() => {
    if (inputDestinatario.length > 0) {
      api
        .get("/personal_nombres") // Asumiendo que este endpoint devuelve {id, nombre, apellido, legajo, nombre_completo}
        .then((res) => {
          setUsuarios(res.data);
          setMostrarSugerencias(true);
        })
        .catch((err) => console.error("Error al obtener usuarios", err));
    } else {
      setMostrarSugerencias(false);
    }
  }, [inputDestinatario]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const seleccionarDestinatario = (usuario) => {
    if (usuario && !destinatarios.some((d) => d.id === usuario.id) && usuario.legajo !== formData.remitente_id) {
      setDestinatarios([...destinatarios, usuario]);
    }
    setInputDestinatario("");
    setIndiceSeleccionado(-1);
    setMostrarSugerencias(false);
    inputDestinatarioRef.current?.focus();
  };


  const handleKeyDown = (e) => {
    const usuariosFiltrados = usuarios.filter(
        (u) =>
          (u.nombre_completo || `${u.nombre} ${u.apellido}`)
            .toLowerCase()
            .includes(inputDestinatario.toLowerCase()) &&
          u.legajo !== formData.remitente_id &&
          !destinatarios.some(d => d.id === u.id)
      );

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIndiceSeleccionado((prev) => Math.min(prev + 1, usuariosFiltrados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIndiceSeleccionado((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (indiceSeleccionado >= 0 && indiceSeleccionado < usuariosFiltrados.length) {
        seleccionarDestinatario(usuariosFiltrados[indiceSeleccionado]);
      } else if (usuariosFiltrados.length === 1) { // Si solo hay una sugerencia y no se navegó
        seleccionarDestinatario(usuariosFiltrados[0]);
      }
    } else if (e.key === "Escape") {
        setMostrarSugerencias(false);
        setIndiceSeleccionado(-1);
    }
  };

  const handleRemoveDestinatario = (destinatarioARemover) => {
    setDestinatarios(destinatarios.filter((d) => d.id !== destinatarioARemover.id));
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (destinatarios.length === 0) {
        alert("Por favor, agregue al menos un destinatario.");
        return;
    }
    const dataToSend = {
      ...formData,
      destinatarios_ids: destinatarios.map((d) => d.id), // Enviar solo IDs
    };
    try {
      await api.post("/mensajes/enviar", dataToSend);
      // Idealmente usar un toast o notificación no bloqueante en lugar de alert
      alert("Mensaje enviado correctamente.");
      if(onSent) onSent();
      onClose();
    } catch (error) {
      console.error("Error al enviar mensaje", error);
      alert("Hubo un error al enviar el mensaje. Intente nuevamente.");
    }
  };

  const usuariosFiltradosSugerencias = mostrarSugerencias ? usuarios.filter(
    (usuario) =>
      (usuario.nombre_completo || `${usuario.nombre} ${usuario.apellido}`)
        .toLowerCase()
        .includes(inputDestinatario.toLowerCase()) &&
      usuario.legajo !== formData.remitente_id && // No auto-enviarse
      !destinatarios.some(d => d.id === usuario.id) // No sugerir si ya está en la lista
  ) : [];


  return (
    <div className="modal-overlay-fluent">
      <div className="modal-window-fluent" style={{maxWidth: '500px'}}>
        <div className="modal-header-fluent">
          <h3 className="modal-title-fluent">Nuevo Mensaje</h3>
          <button type="button" className="modal-close-btn-fluent" onClick={onClose} aria-label="Cerrar modal">
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleEnviar}>
          <div className="modal-body-fluent">
            <div className="form-group-fluent form-group-fluent-destinatarios">
              <label className="form-label-fluent" htmlFor="destinatarioInput">Para:</label>
              <div className="chips-input-container-fluent" onClick={() => inputDestinatarioRef.current?.focus()}>
                {destinatarios.map((d) => (
                  <div key={d.id} className="chip-fluent">
                    {d.nombre_completo || `${d.nombre} ${d.apellido}`}
                    <button
                      type="button"
                      onClick={() => handleRemoveDestinatario(d)}
                      aria-label={`Quitar a ${d.nombre_completo || `${d.nombre} ${d.apellido}` }`}
                    >
                      &times; {/* Caracter 'x' más estándar */}
                    </button>
                  </div>
                ))}
                <input
                  id="destinatarioInput"
                  ref={inputDestinatarioRef}
                  type="text"
                  placeholder={destinatarios.length === 0 ? "Agregar destinatario" : ""}
                  className="input-destinatario-fluent"
                  value={inputDestinatario}
                  onChange={(e) => setInputDestinatario(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => inputDestinatario.length > 0 && setMostrarSugerencias(true)}
                  // onBlur={() => setTimeout(() => setMostrarSugerencias(false), 150)} // Pequeño delay para permitir click en sugerencia
                />
              </div>
              {mostrarSugerencias && usuariosFiltradosSugerencias.length > 0 && (
                <ul className="lista-sugerencias-fluent">
                  {usuariosFiltradosSugerencias.map((usuario, index) => (
                    <li
                      key={usuario.id}
                      className={index === indiceSeleccionado ? "sugerencia-activa-fluent" : ""}
                      onClick={() => seleccionarDestinatario(usuario)}
                      onMouseEnter={() => setIndiceSeleccionado(index)} // Para selección con mouse
                    >
                      {usuario.nombre_completo || `${usuario.nombre} ${usuario.apellido}`} ({usuario.legajo})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="form-group-fluent">
                <label className="form-label-fluent" htmlFor="asuntoInputModal">Asunto:</label>
                <input
                    id="asuntoInputModal"
                    type="text"
                    name="asunto"
                    className="form-control-fluent"
                    value={formData.asunto}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group-fluent">
                <label className="form-label-fluent" htmlFor="cuerpoTextareaModal">Mensaje:</label>
                <textarea
                    id="cuerpoTextareaModal"
                    name="cuerpo"
                    className="form-control-fluent"
                    rows="5" // Altura inicial
                    value={formData.cuerpo}
                    onChange={handleChange}
                    required
                />
            </div>
          </div>

          <div className="modal-footer-fluent">
            <button type="button" className="btn-fluent" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-fluent btn-fluent-primary">
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EnviarMensajeModal;
