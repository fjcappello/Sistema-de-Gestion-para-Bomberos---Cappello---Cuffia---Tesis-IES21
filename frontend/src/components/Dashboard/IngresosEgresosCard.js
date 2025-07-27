import React, { useState, useEffect } from "react";
import api from "../../api";
import "../Styles/Dashboard.css";
import Modal from "./ModalCards";

// Componente para registrar ingresos y egresos de personas al cuartel (en caso de ser externo pueden agregarlo manualmente)
// También muestra los últimos 4 movimientos registrados
function IngresosEgresosCard({ movimientos = [], onRegistrar }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    estado_id: "",
  });
  const [personal, setPersonal] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const fetchPersonal = async () => {
      try {
        const response = await api.get("/personal_nombres");
        const data = response.data;
        setPersonal(data);
      } catch (error) {
        console.error("Error al cargar personal:", error);
      }
    };

    fetchPersonal();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectPersona = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    if (id === "") {
      setFormData({ nombre: "", apellido: "", dni: "", estado_id: "" });
    } else {
      const persona = personal.find((p) => p.id.toString() === id);
      if (persona) {
        const [nombre, apellido] = persona.nombre_completo.split(" ");
        setFormData({
          nombre,
          apellido,
          dni: persona.id.toString(),
          estado_id: "",
        });
      }
    }
  };

  const handleRegistro = (estado_id) => {
    if (!formData.nombre || !formData.apellido || !formData.dni || !estado_id) {
      alert("Complete todos los campos");
      return;
    }
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    // Lógica para evitar registros incorrectos
    const registros = movimientos.filter((m) => m.dni === formData.dni);
    const ultimoEstado = registros.length > 0 ? registros[0].estado : null;

    if (estado_id === 1 && ultimoEstado === "Ingreso") {
      alert("La persona ya se encuentra ingresada.");
      return;
    }

    if (estado_id === 2 && ultimoEstado !== "Ingreso") {
      alert("No se puede marcar egreso sin haber ingresado previamente.");
      return;
    }

    onRegistrar({ ...formData, estado_id, usuario_id: usuario?.legajo });
    setFormData({ nombre: "", apellido: "", dni: "", estado_id: "" });
    setSelectedId("");
    setIsModalOpen(false);
  };

  const ultimosMovimientos = movimientos.slice(0, 4);

  return (
    <div className="ingresos-egresos-card">
      <h3>Ingresos y Egresos</h3>
      <table className="tabla-movimientos">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Nombre completo</th>
            <th>Tipo de registro</th>
          </tr>
        </thead>
        <tbody>
          {ultimosMovimientos.map((m, index) => (
            <tr key={index}>
              <td>
                {new Date(m.timestamp).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </td>
              <td>
                {new Date(m.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </td>
              <td>
                {m.nombre} {m.apellido}
              </td>
              <td>{m.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setIsModalOpen(true)}>Registrar Movimiento</button>

      {isModalOpen && (
        <Modal>
          <h3>Registrar Movimiento</h3>
          <select
            className="persona-select"
            value={selectedId}
            onChange={handleSelectPersona}
          >
            <option value="">Ingreso Manual</option>
            {personal.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre_completo}
              </option>
            ))}
          </select>
          <br />
          <br />
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={(e) => {
              const letras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
              if (!selectedId && letras.test(e.target.value)) {
                handleChange(e);
              }
            }}
            disabled={!!selectedId}
          />
          <input
            type="text"
            name="apellido"
            placeholder="Apellido"
            value={formData.apellido}
            onChange={(e) => {
              const letras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
              if (!selectedId && letras.test(e.target.value)) {
                handleChange(e);
              }
            }}
            disabled={!!selectedId}
          />
          <input
            type="text"
            name="dni"
            placeholder="DNI"
            value={formData.dni}
            onChange={(e) => {
              const numeros = /^[0-9]*$/;
              if (
                !selectedId &&
                numeros.test(e.target.value) &&
                e.target.value.length <= 8
              ) {
                handleChange(e);
              }
            }}
            disabled={!!selectedId}
          />
          <br />
          <br />
          <div className="modal-buttons">
            <button className="submit-btn" onClick={() => handleRegistro(1)}>Marcar Ingreso</button>
            <button className="cancel-btn" onClick={() => handleRegistro(2)}>Marcar Egreso</button>
            <button className="cancel-btn"
              onClick={() => {
                setFormData({
                  nombre: "",
                  apellido: "",
                  dni: "",
                  estado_id: "",
                });
                setSelectedId("");
                setIsModalOpen(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default IngresosEgresosCard;
