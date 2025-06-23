import React, { useState, useEffect } from "react";
import api from "../../api";
// Los estilos específicos de la card ahora están en Dashboard.css bajo .ingresos-egresos-card-content
// o se usan clases Fluent directamente.
// import "../Styles/Dashboard.css"; // No es necesario importar todo Dashboard.css aquí
// import Modal from "./ModalCards"; // Se reemplazará por la estructura de modal Fluent

// Icono de Cierre (X) simple para el modal (reutilizado)
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
    <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
  </svg>
);

function IngresosEgresosCard({ movimientos = [], onRegistrar }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const initialFormState = { nombre: "", apellido: "", dni: "", estado_id: "" };
  const [formData, setFormData] = useState(initialFormState);
  const [personal, setPersonal] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    const fetchPersonal = async () => {
      try {
        const response = await api.get("/personal_nombres");
        setPersonal(response.data);
      } catch (error) {
        console.error("Error al cargar personal:", error);
      }
    };
    fetchPersonal();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Aplicar validaciones directamente aquí si es necesario
    if (name === "nombre" || name === "apellido") {
        const letras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
        if (!letras.test(value)) return;
    }
    if (name === "dni") {
        const numeros = /^[0-9]*$/;
        if (!numeros.test(value) || value.length > 8) return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectPersona = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    if (id === "") {
      setFormData(initialFormState);
    } else {
      const personaSeleccionada = personal.find((p) => p.id.toString() === id);
      if (personaSeleccionada) {
        // Asumiendo que nombre_completo existe y se puede splitear de forma segura
        const [nombre = "", apellido = ""] = (personaSeleccionada.nombre_completo || "").split(" ");
        setFormData({
          nombre,
          apellido,
          dni: personaSeleccionada.id.toString(), // O personaSeleccionada.dni si existe
          estado_id: "",
        });
      }
    }
  };

  const handleRegistro = (estado_id) => {
    if (!formData.nombre || !formData.apellido || !formData.dni || !estado_id) {
      alert("Complete todos los campos requeridos.");
      return;
    }
    // const usuario = JSON.parse(localStorage.getItem("usuario")); // Ya no se usa aquí
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

    onRegistrar({ ...formData, estado_id }); // Removido usuario_id, se debe manejar en el backend o contexto global
    setFormData(initialFormState);
    setSelectedId("");
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setFormData(initialFormState);
    setSelectedId("");
    setIsModalOpen(false);
  }

  const ultimosMovimientos = movimientos.slice(0, 5); // Mostrar 5 para más info

  return (
    // El div con .card-fluent se aplica en Dashboard.js
    // Aquí se usa un div para el contenido específico de esta card
    <div className="ingresos-egresos-card-content">
      <h3 className="card-title-fluent">Últimos Movimientos</h3> {/* Título Fluent */}
      {ultimosMovimientos.length > 0 ? (
        <table className="table-fluent" style={{marginBottom: 'var(--spacing-md)'}}> {/* Tabla Fluent */}
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Nombre completo</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {ultimosMovimientos.map((m, index) => (
              <tr key={m.id || index}> {/* Usar m.id si está disponible */}
                <td>{new Date(m.timestamp).toLocaleDateString("es-AR")}</td>
                <td>{new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}</td>
                <td>{m.nombre} {m.apellido}</td>
                <td>{m.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{color: 'var(--color-fluent-text-secondary)', textAlign: 'center', margin: 'var(--spacing-lg) 0'}}>
          No hay movimientos recientes.
        </p>
      )}
      <button onClick={() => setIsModalOpen(true)} className="btn-fluent btn-fluent-primary" style={{width: '100%'}}>
        Registrar Movimiento
      </button>

      {isModalOpen && (
        <div className="modal-overlay-fluent">
          <div className="modal-window-fluent" style={{maxWidth: '480px'}}>
            <div className="modal-header-fluent">
              <h3 className="modal-title-fluent">Registrar Movimiento</h3>
              <button type="button" className="modal-close-btn-fluent" onClick={closeModal} aria-label="Cerrar">
                <CloseIcon />
              </button>
            </div>
            {/* No se usa <form> aquí ya que los botones tienen su propio onClick */}
            <div className="modal-body-fluent">
              <div className="form-group-fluent">
                <label htmlFor="personaSelectModal" className="form-label-fluent">Seleccionar Personal (Opcional)</label>
                <select
                  id="personaSelectModal"
                  className="form-control-fluent"
                  value={selectedId}
                  onChange={handleSelectPersona}
                >
                  <option value="">Ingreso Manual...</option>
                  {personal.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre_completo} ({p.legajo || p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-fluent">
                <label htmlFor="nombreModal" className="form-label-fluent">Nombre</label>
                <input
                  id="nombreModal"
                  type="text"
                  name="nombre"
                  placeholder="Nombre"
                  className="form-control-fluent"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={!!selectedId}
                  required={!selectedId}
                />
              </div>
              <div className="form-group-fluent">
                <label htmlFor="apellidoModal" className="form-label-fluent">Apellido</label>
                <input
                  id="apellidoModal"
                  type="text"
                  name="apellido"
                  placeholder="Apellido"
                  className="form-control-fluent"
                  value={formData.apellido}
                  onChange={handleChange}
                  disabled={!!selectedId}
                  required={!selectedId}
                />
              </div>
              <div className="form-group-fluent">
                <label htmlFor="dniModal" className="form-label-fluent">DNI</label>
                <input
                  id="dniModal"
                  type="text"
                  name="dni"
                  placeholder="DNI"
                  className="form-control-fluent"
                  value={formData.dni}
                  onChange={handleChange}
                  disabled={!!selectedId}
                  required={!selectedId}
                />
              </div>
            </div>
            <div className="modal-footer-fluent" style={{justifyContent: 'space-between'}}> {/* Botones distribuidos */}
              <button type="button" className="btn-fluent" onClick={closeModal}>
                Cancelar
              </button>
              <div style={{display: 'flex', gap: 'var(--spacing-sm)'}}>
                <button type="button" onClick={() => handleRegistro(1)} className="btn-fluent" style={{backgroundColor: 'var(--color-success)', color: 'white', borderColor: 'var(--color-success)'}}>
                  Marcar Ingreso
                </button>
                <button type="button" onClick={() => handleRegistro(2)} className="btn-fluent" style={{backgroundColor: 'var(--color-fluent-text-error)', color: 'white', borderColor: 'var(--color-fluent-text-error)'}}>
                  Marcar Egreso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IngresosEgresosCard;
