import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ClimaCard() {
  const [clima, setClima] = useState(null);
  const [error, setError] = useState(null);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  const API_KEY = 'a459fade0d7cf6e5faba82ffe2e5ef49';
  const lat = -31.2611;
  const lon = -64.4639;


  const obtenerClima = async () => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
      );
      setClima(response.data);
      setUltimaActualizacion(new Date());
      setError(null);
    } catch (err) {
      const mensaje = err.response?.status
        ? `Error ${err.response.status}: ${err.response.data.message}`
        : 'No se pudo obtener el clima para Santa María de Punilla';
      setError(mensaje);
      setClima(null);
      setUltimaActualizacion(null);
    }
  };

  useEffect(() => {
    obtenerClima();
    const interval = setInterval(() => {
      obtenerClima();
    }, 3600000); // 1 hora

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h3>Clima Actual</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {clima ? (
        <>
          <p><strong>Ubicación:</strong> {clima.name}</p>
          <p><strong>Temperatura:</strong> {clima.main.temp}°C</p>
          <p><strong>Humedad:</strong> {clima.main.humidity}%</p>
          <p><strong>Presión:</strong> {clima.main.pressure} hPa</p>
          <p><strong>Viento:</strong> {clima.wind.speed} m/s</p>
          <p><strong>Condición:</strong> {clima.weather[0].description}</p>
          <p style={{ fontSize: '0.85rem', color: '#555' }}>
            Última actualización: {ultimaActualizacion?.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </>
      ) : (
        !error && <p>Cargando clima...</p>
      )}
    </div>
  );
}

export default ClimaCard;
