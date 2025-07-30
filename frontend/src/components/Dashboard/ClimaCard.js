import React, { useEffect, useState } from "react";
import api from "../../api";

function ClimaCard() {
  const [clima, setClima] = useState(null);
  const [error, setError] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  const API_KEY = "a459fade0d7cf6e5faba82ffe2e5ef49";
  const lat = -31.2611;
  const lon = -64.4639;

  //Funcion que obtiene los datos del clima desde la API de OpenWeatherMap, la posicion se situa en la jurisdiccion del comitente 
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
            {/* Calculo FWI con cambio de unidades para el calculo, aproximado ya que IDECOR no posee api propia para obtenerlo */}
            <strong>🔥 Riesgo FWI*:</strong>{" "}
            {(() => {
              const T = clima.main.temp; //Temperatura en °C
              const H = clima.main.humidity; // Humedad relativa en %
              const V = clima.wind.speed * 3.6; // Velocidad del viento en Km/h
              const P = clima.rain?.["1h"] || 0; // Precipitacion en la ultima hora en mm

              let mo = (147.2 * (101.0 - 85.0)) / (59.5 + 85.0); // Calculo de la humedad en material fino sin lluvia
              // Si hay lluvia, se ajusta la humedad
              if (P > 0.5) {
                let rf = P > 1.5 ? P - 1.5 : 0;
                let mr =
                  mo +
                  42.5 *
                    rf *
                    Math.exp(-100.0 / (251.0 - mo)) *
                    (1 - Math.exp(-6.93 / rf));
                mo = Math.min(mr, 250);
              }

              // Calculo valores intermedios de equilibrio de humedad
              //humedad diurna
              let Ed =
                0.942 * Math.pow(H, 0.679) +
                11 * Math.exp((H - 100) / 10) +
                0.18 * (21.1 - T) * (1 - Math.exp(-0.115 * H));
              //humedad nocturna
              let Ew =
                0.618 * Math.pow(H, 0.753) +
                10 * Math.exp((H - 100) / 10) +
                0.18 * (21.1 - T) * (1 - Math.exp(-0.115 * H));
              // Calculo de la tasa de secado y ajuste de humedad

              let ko =
                0.424 * (1 - Math.pow(H / 100.0, 1.7)) +
                0.0694 * Math.sqrt(V) * (1 - Math.pow(H / 100.0, 8));
              let kd = ko * 0.581 * Math.exp(0.0365 * T);
              mo = Ew + (mo - Ew) * Math.pow(10, -kd);

              // Calculo Fine Fuel Moisture Code, se mide la facilidad con la que se
              // enciende el combustimbre fino
              const FFMC = (59.5 * (250 - mo)) / (147.2 + mo);

              // Calculo de Initial Spread Index, mide la velocidad de propagación del fuego
              // en condiciones de viento y humedad
              const fW = Math.exp(0.081 * V);
              const fF =
                91.9 *
                Math.exp(-0.1386 * mo) *
                (1 + Math.pow(mo, 5.31) / 4.93e7);
              const ISI = 0.208 * fW * fF;

              // Calculo de Duff Moisture Code, representa la sequedad del material grueso
              const DMC =
                400 * Math.log(1 + (3 * T) / H) * (1 - Math.exp(-0.1 * P));
              const DC = T > 0 ? 0.36 * (800 * Math.exp(-0.05 * P)) : 0;

              // Calculo de Buildup Index, mide la acumulación de combustible
              let BUI;
              if (DMC <= 0.4 * DC) {
                BUI = (0.8 * DMC * DC) / (DMC + 0.4 * DC);
              } else {
                BUI = DMC - (1 - (0.8 * DC) / (DMC + 0.4 * DC));
              }

              const fD = 0.626 * Math.pow(BUI, 0.809) + 2;
              const B_val = 0.1 * ISI * fD;
              const FWI =
                B_val > 1 ? Math.exp(2.72 * Math.pow(B_val, 0.647)) : B_val;

              // Dependiendo el valor del FWI, se determina el riesgo de incendio
              let riesgo = "Desconocido";
              if (FWI < 5) riesgo = "Bajo";
              else if (FWI < 12) riesgo = "Moderado";
              else if (FWI < 30) riesgo = "Alto";
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
            <p>
              *El índice FWI es calculado automaticamente y puede variar según
              las condiciones climáticas actuales, usar de referencia y no como
              un valor absoluto.
            </p>
          </div>
        </div>
      ) : (
        !error && <p style={{ textAlign: "center" }}>Cargando clima...</p>
      )}
    </div>
  );
}

export default ClimaCard;
