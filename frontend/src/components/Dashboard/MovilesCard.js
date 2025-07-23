import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import api from "../../api";
import "../Styles/Dashboard.css";

function MovilesCard() {
  const [movimientos, setMovimientos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarUltimosMovimientos = async () => {
      try {
        const response = await api.get("/moviles_movimientos");
        const datos = response.data.slice(0, 4);
        setMovimientos(datos);
      } catch (error) {
        console.error("Error al cargar movimientos recientes:", error);
      }
    };

    cargarUltimosMovimientos();
  }, []);

  const irAGestionMoviles = () => {
    navigate("/reportes/movimientos-moviles");
  };

  return (
    <div className="ingresos-egresos-card">
      <h3>Movimientos de Moviles</h3>
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
        <button onClick={irAGestionMoviles}>
          Ir a gestión de móviles
        </button>
      </div>
    </div>
  );
}

export default MovilesCard;
