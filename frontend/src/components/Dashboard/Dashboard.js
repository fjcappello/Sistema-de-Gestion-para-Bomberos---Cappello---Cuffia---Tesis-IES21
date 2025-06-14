import React, { useEffect, useState } from "react";
import { useUsuario } from "../../context/UserContext";
import "../Styles/Dashboard.css";
import api from "../../api";

import IngresosEgresosCard from "./IngresosEgresosCard";
import ClimaCard from "./ClimaCard";
import MovilesCard from "./MovilesCard";
import EstadisticasCard from "./EstadisticasCard";

function Dashboard() {
  const { usuario } = useUsuario();
  const [horaActual, setHoraActual] = useState(new Date());
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(new Date());
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const response = await api.get(
          "/movimientos_cuartel"
        );
        setMovimientos(response.data.data);
      } catch (error) {
        console.error("Error al obtener movimientos:", error);
      }
    };

    fetchMovimientos();
    const interval = setInterval(fetchMovimientos, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRegistrar = async ({ nombre, apellido, dni, estado_id }) => {
    try {
      await api.post("/movimientos_cuartel", {
        id_personal: null,
        nombre,
        apellido,
        dni,
        estado_id,
      });
      const response = await api.get(
        "/movimientos_cuartel"
      );
      setMovimientos(response.data.data);
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
    }
  };

  const obtenerSaludo = () => {
    const hora = horaActual.getHours();
    if (hora >= 6 && hora < 12) return "Buenos días";
    if (hora >= 12 && hora < 20) return "Buenas tardes";
    return "Buenas noches";
  };

  const abrirModalSalida = (movimiento = null) => {
    console.log("Abrir modal de salida", movimiento);
  };

  const abrirModalRetorno = (movimiento) => {
    console.log("Abrir modal de retorno", movimiento);
  };

  return (
    <div className="dashboard-container">
      <div className="bienvenida-usuario">
        {obtenerSaludo()}, <strong>{usuario?.nombreCompleto}</strong>.{" "}
        {horaActual.toLocaleDateString("es-AR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}{" "}
        -{" "}
        {horaActual.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <IngresosEgresosCard
            movimientos={movimientos}
            onRegistrar={handleRegistrar}
          />
        </div>
        <div className="dashboard-card">
          <ClimaCard />
        </div>
        <div className="dashboard-card">
          <MovilesCard
            abrirModalSalida={abrirModalSalida}
            abrirModalRetorno={abrirModalRetorno}
          />
        </div>
        <div className="dashboard-card">
          <EstadisticasCard />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
