import React, { useEffect, useState } from "react";
import { useUsuario } from "../../context/UserContext";
import "../Styles/Dashboard.css"; // Estilos Fluent para Dashboard
import api from "../../api"; // Asumiendo que la ruta es correcta

// Importar subcomponentes del Dashboard
import IngresosEgresosCard from "./IngresosEgresosCard";
import ClimaCard from "./ClimaCard";
import MovilesCard from "./MovilesCard";
import EstadisticasCard from "./EstadisticasCard";

function Dashboard() {
  const { usuario } = useUsuario();
  const [horaActual, setHoraActual] = useState(new Date());
  // El estado de movimientos y la lógica de handleRegistrar parecen más apropiados
  // dentro de IngresosEgresosCard si solo se usan allí.
  // Si se usan en otros lugares del Dashboard, pueden permanecer aquí.
  // Por ahora, los mantendré aquí para consistencia con el original.
  const [movimientos, setMovimientos] = useState([]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(new Date());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const response = await api.get("/movimientos_cuartel");
        setMovimientos(response.data);
      } catch (error) {
        console.error("Error al obtener movimientos:", error);
      }
    };

    fetchMovimientos();
    const interval = setInterval(fetchMovimientos, 5000); // Refrescar movimientos más seguido
    return () => clearInterval(interval);
  }, []);

  // Esta función probablemente debería moverse a IngresosEgresosCard
  // si ese es el único lugar donde se usa el formulario de registro.
  const handleRegistrar = async ({ nombre, apellido, dni, estado_id }) => {
    try {
      await api.post("/movimientos_cuartel", {
        id_personal: null, // O el ID si se selecciona de una lista
        nombre,
        apellido,
        dni,
        estado_id,
      });
      // Volver a cargar movimientos después de registrar uno nuevo
      const response = await api.get("/movimientos_cuartel");
      setMovimientos(response.data);
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      // Considerar mostrar un error al usuario
    }
  };

  const obtenerSaludo = () => {
    const hora = horaActual.getHours();
    if (hora >= 6 && hora < 12) return "Buenos días";
    if (hora >= 12 && hora < 20) return "Buenas tardes";
    return "Buenas noches";
  };

  // Funciones de modal para MovilesCard (probablemente se muevan a MovilesCard)
  const abrirModalSalida = (movimiento = null) => {
    console.log("Abrir modal de salida (Dashboard)", movimiento);
    // Lógica para mostrar modal de salida de móvil
  };

  const abrirModalRetorno = (movimiento) => {
    console.log("Abrir modal de retorno (Dashboard)", movimiento);
    // Lógica para mostrar modal de retorno de móvil
  };

  return (
    <div className="dashboard-container-fluent"> {/* Clase Fluent */}
      <div className="dashboard-header"> {/* Nuevo contenedor para el saludo */}
        <div className="bienvenida-usuario-fluent"> {/* Clase Fluent */}
          {obtenerSaludo()}, <strong>{usuario?.nombreCompleto || "Usuario"}</strong>.{" "}
          {horaActual.toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            // year: "numeric", // Año opcional si se quiere más corto
          })}{" "}
          -{" "}
          {horaActual.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </div>
        {/* Aquí podrían ir otros controles globales del Dashboard si fueran necesarios */}
      </div>

      <div className="dashboard-grid-fluent"> {/* Clase Fluent */}
        <div className="card-fluent"> {/* Clase Fluent para cada tarjeta */}
          {/* El contenido específico de la card se maneja con clases como .ingresos-egresos-card-content */}
          {/* o aplicando clases Fluent directamente en el subcomponente */}
          <IngresosEgresosCard
            movimientos={movimientos}
            onRegistrar={handleRegistrar} // Pasar la función de registro
          />
        </div>
        <div className="card-fluent"> {/* Clase Fluent */}
          <ClimaCard />
        </div>
        <div className="card-fluent"> {/* Clase Fluent */}
          <MovilesCard
            abrirModalSalida={abrirModalSalida} // Estas props podrían ser manejadas internamente por MovilesCard
            abrirModalRetorno={abrirModalRetorno}
          />
        </div>
        <div className="card-fluent"> {/* Clase Fluent */}
          <EstadisticasCard />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
