import React, { useState, useEffect, useRef } from "react";
import api from "../api";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./Styles/ReportsPage.css";
import { useUsuario } from "../context/UserContext";

function ReportsPage() {
  const { usuario } = useUsuario();
  const [filters, setFilters] = useState({
    jefeDotacion: "",
    tipoAsistencia: "",
    startDate: "",
    endDate: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    jefeDotacion: "",
    tipoAsistencia: "",
    startDate: "",
    endDate: "",
  });
  const [jefesDotacion, setJefesDotacion] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }],
  });
  const [logoDataURI, setLogoDataURI] = useState("");
  const chartRef = useRef(null);
  const [chartPie, setChartPie] = useState({ labels: [], datasets: [] });
  const [chartBombero, setChartBombero] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    fetchJefesDotacion();
    loadLogo();
    fetchReports();
    fetchBombero();
  }, []);

  const fetchBombero = async () => {
    try {
      const response = await api.get("/estadisticas/por_bombero");
      setChartBombero({
        labels: response.data.map((d) => d.nombre_completo),
        datasets: [
          {
            label: "Servicios",
            data: response.data.map((d) => d.cantidad),
            backgroundColor: "#4CAF50",
          },
        ],
      });
    } catch (err) {
      console.error("Error al obtener por bombero:", err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [appliedFilters]);

  useEffect(() => {
    if (chartData.labels.length > 0 && chartData.datasets[0].data.length > 0) {
      const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
      setChartPie({
        labels: chartData.labels,
        datasets: [
          {
            label: "Porcentaje de Intervenciones",
            data: chartData.datasets[0].data.map((v) =>
              ((v / total) * 100).toFixed(2)
            ),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          },
        ],
      });
    }
  }, [chartData]);

  const fetchJefesDotacion = async () => {
    try {
      const response = await api.get("/personal_nombres");
      setJefesDotacion(response.data);
    } catch (err) {
      console.error("Error al cargar jefes:", err);
    }
  };

  const loadLogo = async () => {
    try {
      const response = await fetch("/images/logo.png");
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => setLogoDataURI(reader.result);
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error al cargar el logo:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await api.get("/estadisticas/estadisticas_filtros", {
        params: {
          jefe_dotacion: appliedFilters.jefeDotacion,
          tipo_asistencia: appliedFilters.tipoAsistencia,
          fecha_desde: appliedFilters.startDate,
          fecha_hasta: appliedFilters.endDate,
        },
      });
      const data = response.data;

      setChartData({
        labels: data.map((item) => item.tipo_asistencia),
        datasets: [
          {
            label: "Intervenciones",
            data: data.map((item) => item.cantidad),
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
          },
        ],
      });
    } catch (error) {
      console.error("Error al cargar reportes:", error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const aplicarFiltros = () => {
    setAppliedFilters(filters);
  };

  const limpiarFiltros = () => {
    setFilters({
      jefeDotacion: "",
      tipoAsistencia: "",
      startDate: "",
      endDate: "",
    });
    setAppliedFilters({
      jefeDotacion: "",
      tipoAsistencia: "",
      startDate: "",
      endDate: "",
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    if (logoDataURI) {
      const logoWidth = 30;
      const logoHeight = 30;
      doc.addImage(logoDataURI, "PNG", 10, 10, logoWidth, logoHeight);
    }

    doc.setFontSize(18);
    const title = "Bomberos Santa Maria de Punilla";
    doc.text(title, pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(14);
    const subtitle = "Estadistica de Emergencias";
    doc.text(subtitle, pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(12);
    const jefeSeleccionado =
      jefesDotacion.find((j) => j.id.toString() === appliedFilters.jefeDotacion)
        ?.nombre_completo || "Todos";
    doc.text(`Jefe de Dotación: ${jefeSeleccionado}`, 10, 55);
    doc.text(
      `Tipo de Asistencia: ${appliedFilters.tipoAsistencia || "Todos"}`,
      10,
      65
    );
    doc.text(
      `Fecha Desde: ${appliedFilters.startDate || "Sin especificar"}`,
      10,
      75
    );
    doc.text(
      `Fecha Hasta: ${appliedFilters.endDate || "Sin especificar"}`,
      10,
      85
    );

    if (chartRef.current) {
      const chartCanvas = chartRef.current.canvas;
      const chartImage = chartCanvas.toDataURL("image/png");
      doc.addImage(chartImage, "PNG", 10, 90, 180, 80);
    }

    if (chartPie.datasets.length > 0) {
      const canvasPie = document.querySelectorAll("canvas")[1];
      const imagePie = canvasPie.toDataURL("image/png");
      doc.addPage();
      doc.setFontSize(14);
      doc.text("Intervenciones por Tipo (%)", pageWidth / 2, 20, {
        align: "center",
      });
      doc.addImage(imagePie, "PNG", 10, 30, 180, 80);
    }

    if (chartBombero.datasets.length > 0) {
      const canvasBombero = document.querySelectorAll("canvas")[2];
      const imageBombero = canvasBombero.toDataURL("image/png");
      doc.addPage();
      doc.setFontSize(14);
      doc.text("Intervenciones por Bombero", pageWidth / 2, 20, {
        align: "center",
      });
      doc.addImage(imageBombero, "PNG", 10, 30, 180, 100);
    }

    doc.setFontSize(14);
    doc.text("Análisis de Datos:", 10, 180);
    doc.setFontSize(12);
    chartData.labels.forEach((label, index) => {
      const cantidad = chartData.datasets[0].data[index];
      doc.text(`- ${label}: ${cantidad} intervenciones`, 10, 190 + index * 10);
    });

    const printDate = new Date().toLocaleString();
    doc.setFontSize(10);
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const nombreUsuario = usuario?.nombre
      ? `${usuario.nombre} ${usuario.apellido}`
      : "usuario desconocido";
    doc.text(
      `Impreso el ${printDate} por ${usuario?.nombreCompleto || "Sistema"}`,
      10,
      doc.internal.pageSize.getHeight() - 10
    );

    const formattedDate = new Date()
      .toLocaleString("es-AR")
      .replace(/[/,:]/g, "-")
      .replace(" ", "_");
    doc.save(`Estadisticas_Emergencias_${formattedDate}.pdf`);
  };

  return (
    <div className="table-container">
      <h2 className="table-title">Estadistica de Emergencias</h2>
      <div className="botonera_tablas">
        <button onClick={generatePDF} className="add-report-btn">
          Generar PDF del Reporte
        </button>
      </div>

      <div className="filtros">
        <select
          name="jefeDotacion"
          onChange={handleFilterChange}
          value={filters.jefeDotacion}
        >
          <option value="" disabled hidden>
            Jefe de Dotación
          </option>
          <option value="">Todos</option>
          {jefesDotacion.map((jefe) => (
            <option key={jefe.id} value={jefe.id}>
              {jefe.nombre_completo}
            </option>
          ))}
        </select>

        <select
          name="tipoAsistencia"
          onChange={handleFilterChange}
          value={filters.tipoAsistencia}
        >
          <option value="" disabled hidden>
            Tipo de Asistencia
          </option>
          <option value="">Todos</option>
          <option value="Incendio">Incendio</option>
          <option value="Accidente">Accidente</option>
          <option value="Rescate">Rescate</option>
        </select>

        <input
          type="date"
          name="startDate"
          onChange={handleFilterChange}
          value={filters.startDate}
          placeholder="Fecha Desde"
        />

        <input
          type="date"
          name="endDate"
          onChange={handleFilterChange}
          value={filters.endDate}
          placeholder="Fecha Hasta"
        />

        <button onClick={aplicarFiltros} className="filter-btn">
          Aplicar Filtros
        </button>
        <button onClick={limpiarFiltros} className="filter-btn">
          Limpiar filtros
        </button>
      </div>

      <div className="chart-container">
        <h3>Intervenciones por Tipo</h3>
        {chartData.labels.length > 0 ? (
          <Bar ref={chartRef} data={chartData} options={{ responsive: true }} />
        ) : (
          <p>No hay datos disponibles para mostrar.</p>
        )}
      </div>

      <div className="chart-container">
        <h3>Intervenciones por Tipo (Expresado en %) </h3>
        {chartPie.labels.length > 0 ? (
          <div style={{ width: "450px", height: "450px", margin: "0 auto" }}>
            <Pie
              data={chartPie}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        ) : (
          <p>No hay datos disponibles para mostrar.</p>
        )}
      </div>

      <div className="chart-container">
        <h3>Intervenciones por Bombero</h3>
        {chartBombero.labels.length > 0 ? (
          <Bar
            data={chartBombero}
            options={{ responsive: true, indexAxis: "y" }}
          />
        ) : (
          <p>No hay datos disponibles para mostrar.</p>
        )}
      </div>
    </div>
  );
}

export default ReportsPage;
