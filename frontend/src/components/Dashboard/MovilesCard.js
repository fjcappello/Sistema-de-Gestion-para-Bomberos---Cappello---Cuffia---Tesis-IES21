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

  const cargarUltimosMovimientos = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/moviles_movimientos"
      );
      const datos = response.data.slice(-4).reverse(); // últimos 4 movimientos
      setMovimientos(datos);
    } catch (error) {
      console.error("Error al cargar movimientos recientes:", error);
    }
  };

  useEffect(() => {
    cargarUltimosMovimientos();
  }, []);

  // Nueva función para manejar el registro
  const handleRegistro = async () => {
    try {
      if (tipoMovimiento === "salida") {
        if (!formData.movil_id || !formData.chofer || !formData.destino) {
          alert("Complete todos los campos para registrar una salida.");
          return;
        }
        await axios.post("http://localhost:3001/moviles/salida", {
          movil_id: formData.movil_id,
          chofer: formData.chofer,
          destino: formData.destino,
        });
      } else {
        if (!formData.movil_id || !formData.kilometraje) {
          alert("Complete todos los campos para registrar un retorno.");
          return;
        }
        await axios.post("http://localhost:3001/moviles/retorno", {
          movil_id: formData.movil_id,
          kilometraje: formData.kilometraje,
          novedades: formData.novedades,
        });
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
              <input
                type="text"
                placeholder="ID del móvil"
                value={formData.movil_id}
                onChange={(e) =>
                  setFormData({ ...formData, movil_id: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Chofer"
                value={formData.chofer}
                onChange={(e) =>
                  setFormData({ ...formData, chofer: e.target.value })
                }
              />
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
              <input
                type="text"
                placeholder="ID del móvil"
                value={formData.movil_id}
                onChange={(e) =>
                  setFormData({ ...formData, movil_id: e.target.value })
                }
              />
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
