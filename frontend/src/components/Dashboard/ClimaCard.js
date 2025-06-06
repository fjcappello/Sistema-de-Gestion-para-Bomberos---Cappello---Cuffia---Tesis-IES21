import React, { useEffect, useState } from "react";
import api from "../../api";

function ClimaCard() {
  const [clima, setClima] = useState(null);
  const [error, setError] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  const API_KEY = "a459fade0d7cf6e5faba82ffe2e5ef49";
  const lat = -31.2611;
  const lon = -64.4639;

  const obtenerClima = async () => {
    try {
      const response = await api.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
      );
      setClima(response.data);
      setUltimaActualizacion(new Date());
      setError(null);
    } catch (err) {
      const mensaje = err.response?.status
        ? `Error ${err.response.status}: ${err.response.data.message}`
        : "No se pudo obtener el clima para Santa María de Punilla";
      setError(mensaje);
      setClima(null);
      setUltimaActualizacion(null);
    }
  };

  useEffect(() => {
    obtenerClima();
    const interval = setInterval(() => {
      obtenerClima();
    }, 3600000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#fff",
        padding: "1.5rem",
        maxWidth: "300px",
        margin: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h3 style={{ textAlign: "center", color: "#e60000" }}>
        Clima en Jurisdicción
      </h3>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {clima ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
            fontSize: "0.95rem",
          }}
        >
          <div>
            <strong>🌡️ Temperatura:</strong> {clima.main.temp}°C
          </div>
          <div>
            <strong>🌥️ Condición:</strong> {clima.weather[0].description}
          </div>
          <div>
            <strong>💧 Humedad:</strong> {clima.main.humidity}%
          </div>
          <div>
            <strong>📈 Presión:</strong> {clima.main.pressure} hPa
          </div>
          <div>
            <strong>💨 Viento:</strong> {(clima.wind.speed * 3.6).toFixed(1)}{" "}
            Km/h
          </div>
          <div>
            <strong>🔥 Riesgo FWI:</strong>{" "}
            {(() => {
              const viento = clima.wind.speed;
              const humedad = clima.main.humidity;
              let fwi = (viento * 10) / (humedad + 1);
              let riesgo = "Desconocido";
              if (fwi < 1) riesgo = "Bajo";
              else if (fwi < 3) riesgo = "Moderado";
              else if (fwi < 6) riesgo = "Alto";
              else riesgo = "Extremo";
              return riesgo;
            })()}
          </div>
          <div
            style={{
              gridColumn: "1 / -1",
              fontSize: "0.85rem",
              color: "#555",
              textAlign: "right",
              marginTop: "1rem",
            }}
          >
            Última actualización:{" "}
            {ultimaActualizacion?.toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </div>
        </div>
      ) : (
        !error && <p style={{ textAlign: "center" }}>Cargando clima...</p>
      )}
    </div>
  );
}

export default ClimaCard;
