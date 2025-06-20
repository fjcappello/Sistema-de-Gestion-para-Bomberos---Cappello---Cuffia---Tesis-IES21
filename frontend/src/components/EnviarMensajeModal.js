import React, { useState, useEffect } from "react";
import api from "../api";
import "./Styles/BandejaEntrada.css";
import "./Styles/EnviarMensajeModal.css";
import { useUsuario } from "../context/UserContext";

function EnviarMensajeModal({ onClose, onSent }) {
  const [usuarios, setUsuarios] = useState([]);
  const [destinatarios, setDestinatarios] = useState([]);
  const [inputDestinatario, setInputDestinatario] = useState("");
  const { usuario } = useUsuario();

  const [formData, setFormData] = useState({
    remitente_id: usuario?.legajo || "",
    asunto: "",
    cuerpo: "",
  });
  const [indiceSeleccionado, setIndiceSeleccionado] = useState(-1);

  useEffect(() => {
    api
      .get("/personal_nombres")
      .then((res) => {
        console.log("Usuarios recibidos:", res.data);
        setUsuarios(res.data);
      })
      .catch((err) => console.error("Error al obtener usuarios", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddDestinatario = (e) => {
    if (e.key === "Enter" && inputDestinatario) {
      const destinatario = usuarios.find(
        (usuario) =>
          usuario.nombre + " " + usuario.apellido === inputDestinatario
      );
      if (
        destinatario &&
        !destinatarios.some((d) => d.id === destinatario.id) &&
        destinatario.legajo !== formData.remitente_id
      ) {
        setDestinatarios([...destinatarios, destinatario]);
        setInputDestinatario("");
        setIndiceSeleccionado(-1);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      setIndiceSeleccionado((prev) =>
        Math.min(prev + 1, filteredUsuarios.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      setIndiceSeleccionado((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      if (indiceSeleccionado >= 0) {
        const usuarioSeleccionado = filteredUsuarios[indiceSeleccionado];
        if (
          usuarioSeleccionado &&
          !destinatarios.some((d) => d.id === usuarioSeleccionado.id)
        ) {
          setDestinatarios([...destinatarios, usuarioSeleccionado]);
          setInputDestinatario("");
          setIndiceSeleccionado(-1);
        }
      }
    }
  };

  const handleRemoveDestinatario = (destinatario) => {
    setDestinatarios(destinatarios.filter((d) => d.id !== destinatario.id));
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    const dataToSend = {
      ...formData,
      destinatarios: destinatarios.map((d) => d.id),
    };
    try {
      await api.post("/mensajes/enviar", dataToSend);
      alert("✅ Mensaje enviado correctamente.");
      onSent();
      onClose();
    } catch (error) {
      console.error("Error al enviar mensaje", error);
      alert("❌ Hubo un error al enviar el mensaje. Intente nuevamente.");
    }
  };

  const filteredUsuarios = usuarios.filter(
    (usuario) =>
      (usuario.nombre + " " + usuario.apellido)
        .toLowerCase()
        .includes(inputDestinatario.toLowerCase()) &&
      usuario.legajo !== formData.remitente_id
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Nuevo Mensaje</h3>
        <form onSubmit={handleEnviar} className="form-container">
          <div className="chips-container">
            {destinatarios.map((d, index) => (
              <div key={index} className="chip">
                {d.nombre + " " + d.apellido}
                <button
                  type="button"
                  onClick={() => handleRemoveDestinatario(d)}
                >
                  x
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Agregar destinatario (presiona Enter)"
            value={inputDestinatario}
            onChange={(e) => setInputDestinatario(e.target.value)}
            onKeyDown={(e) => {
              handleAddDestinatario(e);
              handleKeyDown(e);
            }}
          />
          {inputDestinatario.length > 0 && (
            <ul className="lista-sugerencias">
              {filteredUsuarios.map((usuario, index) => (
                <li
                  key={usuario.id}
                  className={
                    index === indiceSeleccionado ? "sugerencia-activa" : ""
                  }
                  onClick={() => {
                    if (!destinatarios.some((d) => d.id === usuario.id)) {
                      setDestinatarios([...destinatarios, usuario]);
                    }
                    setInputDestinatario("");
                    setIndiceSeleccionado(-1);
                  }}
                >
                  {usuario.nombre + " " + usuario.apellido}
                </li>
              ))}
            </ul>
          )}
          <input
            type="text"
            name="asunto"
            placeholder="Asunto"
            value={formData.asunto}
            onChange={handleChange}
            required
          />
          <textarea
            name="cuerpo"
            placeholder="Mensaje"
            value={formData.cuerpo}
            onChange={handleChange}
            required
          />
          <button type="submit" className="submit-btn">
            Enviar
          </button>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
}

export default EnviarMensajeModal;
