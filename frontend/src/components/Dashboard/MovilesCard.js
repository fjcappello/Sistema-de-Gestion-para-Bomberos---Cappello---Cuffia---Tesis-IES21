import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/Dashboard.css";
import Modal from "./ModalCards";

function MovilesCard({ abrirModalSalida, abrirModalRetorno }) {
  const [movimientos, setMovimientos] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tipoMovimiento, setTipoMovimiento] = useState(null);
  const [formData, setFormData] = useState({
    movil_id: "",
    chofer: "",
    destino: "",
    kilometraje: "",
    novedades: "",
  });
  const [movilesDisponibles, setMovilesDisponibles] = useState([]);
  const [choferesDisponibles, setChoferesDisponibles] = useState([]);

  const cargarUltimosMovimientos = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/moviles_movimientos"
      );
      const datos = response.data
        .sort((a, b) => new Date(b.fecha_salida) - new Date(a.fecha_salida))
        .slice(0, 4);
      setMovimientos(datos);
    } catch (error) {
      console.error("Error al cargar movimientos recientes:", error);
    }
  };

  useEffect(() => {
    cargarUltimosMovimientos();
    axios.get("http://localhost:3001/moviles").then((res) => {
      const enServicio = res.data.filter((movil) => movil.movil_estado_id === 1);
      setMovilesDisponibles(enServicio);
    });
    axios.get("http://localhost:3001/personal").then((res) => setChoferesDisponibles(res.data));
  }, []);

  // Nueva función para manejar el registro
  const handleRegistro = async () => {
    try {
      if (tipoMovimiento === "salida") {
        if (!formData.movil_id || !formData.chofer || !formData.destino) {
          alert("Complete todos los campos para registrar una salida.");
          return;
        }
        await axios.post("http://localhost:3001/moviles_salida", {
          movil_id: formData.movil_id,
          legajo_chofer: formData.chofer,
          destino: formData.destino,
        });
      } else {
        if (!formData.movil_id || !formData.kilometraje) {
          alert("Complete todos los campos para registrar un retorno.");
          return;
        }
        await axios.put(`http://localhost:3001/moviles_retorno/${formData.movil_id}`, {
          kilometraje_final: formData.kilometraje,
          novedades: formData.novedades,
        });
        await cargarUltimosMovimientos();
      }
      await cargarUltimosMovimientos();
      setIsModalOpen(false);
      setFormData({
        movil_id: "",
        chofer: "",
        destino: "",
        kilometraje: "",
        novedades: "",
      });
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      alert("Ocurrió un error al registrar el movimiento");
    }
  };

  return (
    <div className="moviles-card">
      <h3 className="moviles-card-titulo">Movimientos de Moviles</h3>
      <table className="moviles-card-tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Móvil</th>
            <th>Chofer</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m) => (
            <tr key={m.id}>
              <td>
                {new Date(m.fecha_salida).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </td>
              <td>
                {new Date(m.fecha_salida).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </td>
              <td>{m.interno}</td>
              <td>{m.chofer}</td>
              <td>{m.fecha_retorno ? "Retorno" : "Salida"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: "10px" }}>
        <button
          className="btn btn-moviles-card"
          onClick={() => {
            setTipoMovimiento("salida");
            setIsModalOpen(true);
          }}
        >
          Marcar salida
        </button>
        <button
          className="btn btn-moviles-card"
          onClick={() => {
            setTipoMovimiento("retorno");
            setIsModalOpen(true);
          }}
        >
          Marcar retorno
        </button>
      </div>
      {isModalOpen && (
        <Modal>
          <h4>
            {tipoMovimiento === "salida"
              ? "Registrar Salida"
              : "Registrar Retorno"}
          </h4>
          {tipoMovimiento === "salida" ? (
            <>
              <select
                value={formData.movil_id}
                onChange={(e) =>
                  setFormData({ ...formData, movil_id: e.target.value })
                }
              >
                <option value="">Seleccione un móvil</option>
                {movilesDisponibles.map((movil) => (
                  <option key={movil.id} value={movil.id}>
                    {movil.interno} - {movil.marca} {movil.modelo}
                  </option>
                ))}
              </select>
              <select
                value={formData.chofer}
                onChange={(e) =>
                  setFormData({ ...formData, chofer: e.target.value })
                }
              >
                <option value="">Seleccione un chofer</option>
                {choferesDisponibles.map((p) => (
                  <option key={p.legajo} value={p.legajo}>
                    {p.nombre_completo || `${p.nombre} ${p.apellido}`}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Destino"
                value={formData.destino}
                onChange={(e) =>
                  setFormData({ ...formData, destino: e.target.value })
                }
              />
            </>
          ) : (
            <>
              <select
                value={formData.movil_id}
                onChange={(e) =>
                  setFormData({ ...formData, movil_id: e.target.value })
                }
              >
                <option value="">Seleccione un móvil en salida</option>
                {movimientos
                  .filter((m) => !m.fecha_retorno)
                  .map((m) => (
                    <option key={m.id} value={m.movil_id}>
                      {m.interno}
                    </option>
                  ))}
              </select>
              <input
                type="number"
                placeholder="Kilometraje actual"
                value={formData.kilometraje}
                onChange={(e) =>
                  setFormData({ ...formData, kilometraje: e.target.value })
                }
              />
              <textarea
                placeholder="Novedades"
                value={formData.novedades}
                onChange={(e) =>
                  setFormData({ ...formData, novedades: e.target.value })
                }
              />
            </>
          )}
          <div className="modal-buttons">
            <button onClick={handleRegistro}>Registrar</button>
            <button onClick={() => setIsModalOpen(false)}>Cancelar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default MovilesCard;
