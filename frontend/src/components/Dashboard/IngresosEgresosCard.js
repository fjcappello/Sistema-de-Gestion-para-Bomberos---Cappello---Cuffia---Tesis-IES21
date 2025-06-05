import React, { useState, useEffect } from "react";
import "../Styles/Dashboard.css";
import Modal from "./ModalCards.js";

function IngresosEgresosCard({ movimientos = [] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    estado_id: "",
  });
  const [personal, setPersonal] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [movimientosActualizados, setMovimientosActualizados] = useState([]);

  useEffect(() => {
    const fetchPersonal = async () => {
      try {
        const response = await fetch("http://localhost:3001/personal_nombres");
        const data = await response.json();
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

  const handleRegistro = async (estado_id) => {
    if (!formData.nombre || !formData.apellido || !formData.dni) {
      alert("Complete todos los campos");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/movimientos_cuartel");
      const movimientos = await response.json();

      const movimientosPersona = movimientos
        .filter((m) => {
          if (selectedId) return m.dni === formData.dni;
          return (
            m.nombre === formData.nombre &&
            m.apellido === formData.apellido &&
            m.dni === formData.dni
          );
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const ultimo = movimientosPersona[0];
      if (
        ultimo &&
        ((estado_id === 1 && ultimo.estado === "Ingreso") ||
         (estado_id === 2 && ultimo.estado === "Egreso"))
      ) {
        const estadoTexto = estado_id === 1 ? "ingresada" : "egresada";
        alert(`La persona ya se encuentra ${estadoTexto}.`);
        return;
      }

      const payload = {
        id_personal: selectedId || null,
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        estado_movimiento_cuartel_id: estado_id,
      };

      await fetch("http://localhost:3001/movimientos_cuartel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const actualizados = await fetch("http://localhost:3001/movimientos_cuartel").then((r) => r.json());
      setMovimientosActualizados(actualizados);

      setFormData({ nombre: "", apellido: "", dni: "", estado_id: "" });
      setSelectedId("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
    }
  };

  const ultimosMovimientos = (movimientosActualizados.length > 0 ? movimientosActualizados : movimientos)
    .filter((m) => m.visible !== 0)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 4);

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
          <h4>Registrar Movimiento</h4>
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
            <button onClick={() => handleRegistro(1)}>Marcar Ingreso</button>
            <button onClick={() => handleRegistro(2)}>Marcar Egreso</button>
            <button
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
