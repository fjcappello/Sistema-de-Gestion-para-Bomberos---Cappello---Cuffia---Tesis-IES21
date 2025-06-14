import React, { useEffect, useState } from "react";
import api from "../api";

function EnviarMensaje() {
  const [usuarios, setUsuarios] = useState([]);
  const [formData, setFormData] = useState({
    remitente_id: "", // Esto deberías setearlo desde el login (ej: localStorage)
    asunto: "",
    cuerpo: "",
  });
  const [destinatarios, setDestinatarios] = useState([]);

  useEffect(() => {
    api
      .get("/personal/nombres")
      .then((res) => setUsuarios(res.data.data))
      .catch((err) => console.error("Error al obtener usuarios", err));

    const usuarioGuardado = localStorage.getItem("usuario");
    if (usuarioGuardado) {
      const { legajo } = JSON.parse(usuarioGuardado);
      setFormData((prev) => ({ ...prev, remitente_id: legajo }));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddDestinatario = (e) => {
    if (e.key === "Enter" && e.target.value) {
      const usuarioSeleccionado = usuarios.find(
        (usuario) =>
          usuario.nombre_completo.toLowerCase() === e.target.value.toLowerCase()
      );
      if (usuarioSeleccionado && !destinatarios.some(d => d.id === usuarioSeleccionado.id)) {
        setDestinatarios([...destinatarios, usuarioSeleccionado]);
      }
      e.target.value = "";
    }
  };

  const handleRemoveDestinatario = (id) => {
    setDestinatarios(destinatarios.filter((d) => d.id !== id));
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    try {
      const finalFormData = {
        ...formData,
        destinatarios: destinatarios.map(d => d.id),
      };
      await api.post("/mensajes", finalFormData);
      alert("Mensaje enviado");
      setFormData((prev) => ({
        ...prev,
        asunto: "",
        cuerpo: "",
      }));
      setDestinatarios([]);
    } catch (error) {
      console.error("Error al enviar mensaje", error);
    }
  };

  return (
    <div>
      <h2>Enviar Mensaje</h2>
      <form onSubmit={handleEnviar}>
        <input
          type="text"
          placeholder="Agregar destinatario y presionar Enter"
          onKeyDown={handleAddDestinatario}
          list="usuarios-list"
        />
        <datalist id="usuarios-list">
          {usuarios.map((usuario) => (
            <option key={usuario.id} value={usuario.nombre_completo} />
          ))}
        </datalist>
        <div>
          {destinatarios.map((destinatario) => (
            <span key={destinatario.id}>
              {destinatario.nombre_completo}{" "}
              <button
                type="button"
                onClick={() => handleRemoveDestinatario(destinatario.id)}
              >
                x
              </button>
            </span>
          ))}
        </div>
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
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default EnviarMensaje;
