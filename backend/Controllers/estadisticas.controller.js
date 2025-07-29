import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EstadisticasEmergencias = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [chartPorBombero, setChartPorBombero] = useState({ labels: [], datasets: [] });
  const [chartPie, setChartPie] = useState({ labels: [], datasets: [] });

  const fetchReports = async () => {
    try {
      const response = await axios.get("/api/estadisticas");
      const data = response.data;

      setChartData({
        labels: data.map((item) => item.tipo_asistencia),
        datasets: [
          {
            label: "Cantidad de Intervenciones",
            data: data.map((item) => item.cantidad),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchPorBombero = async () => {
    try {
      const response = await axios.get("/api/estadisticas/porBombero");
      const data = response.data;

      setChartPorBombero({
        labels: data.map((item) => item.nombre_completo),
        datasets: [
          {
            label: "Cantidad de Intervenciones",
            data: data.map((item) => item.cantidad),
            backgroundColor: "#36A2EB",
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching por bombero:", error);
    }
  };

  useEffect(() => {
    fetchReports();
    fetchPorBombero();
  }, []);

  useEffect(() => {
    if (chartData.labels.length > 0 && chartData.datasets[0].data.length > 0) {
      const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
      setChartPie({
        labels: chartData.labels,
        datasets: [
          {
            label: "Porcentaje de Intervenciones",
            data: chartData.datasets[0].data.map(v => ((v / total) * 100).toFixed(2)),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          },
        ],
      });
    }
  }, [chartData]);

  return (
    <div>
      <div className="chart-container">
        <h3>Intervenciones por Tipo</h3>
        {chartData.labels.length > 0 ? (
          <Bar data={chartData} options={{ responsive: true }} />
        ) : (
          <p>No hay datos disponibles para mostrar.</p>
        )}
      </div>

      <div className="chart-container">
        <h3>Intervenciones por Bombero</h3>
        {chartPorBombero.labels.length > 0 ? (
          <Bar data={chartPorBombero} options={{ responsive: true }} />
        ) : (
          <p>No hay datos disponibles para mostrar.</p>
        )}
      </div>

      <div className="chart-container">
        <h3>Intervenciones por Tipo (%)</h3>
        {chartPie.labels.length > 0 ? (
          <Pie data={chartPie} options={{ responsive: true }} />
        ) : (
          <p>No hay datos disponibles para mostrar.</p>
        )}
      </div>
    </div>
  );
};

export default EstadisticasEmergencias;
