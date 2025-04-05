import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Styles/ReportsPage.css';

function ReportsPage() {
  const [filters, setFilters] = useState({
    jefeDotacion: '',
    tipoAsistencia: '',
    startDate: '',
    endDate: '',
  });
  const [jefesDotacion, setJefesDotacion] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{ data: [], backgroundColor: [] }],
  });
  const [logoDataURI, setLogoDataURI] = useState('');
  const chartRef = useRef(null);

  useEffect(() => {
    fetchJefesDotacion();
    loadLogo();
  }, []);

  const fetchJefesDotacion = async () => {
    try {
      const response = await axios.get('http://localhost:3001/personal_nombres');
      setJefesDotacion(response.data);
    } catch (err) {
      console.error("Error al cargar jefes:", err);
    }
  };

  const loadLogo = async () => {
    try {
      const response = await fetch('/images/logo.png');
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => setLogoDataURI(reader.result);
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error al cargar el logo:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get('http://localhost:3001/reportes', { params: filters });
      const data = response.data;

      setChartData({
        labels: data.map(item => item.tipo_asistencia),
        datasets: [{
          label: 'Intervenciones',
          data: data.map(item => item.cantidad),
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        }],
      });
    } catch (error) {
      console.error('Error al cargar reportes:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Agregar logo 
    if (logoDataURI) {
      const logoWidth = 30;
      const logoHeight = 30;
      doc.addImage(logoDataURI, 'PNG', 10, 10, logoWidth, logoHeight);
    }

    doc.setFontSize(18);
    const title = 'Bomberos Santa Maria de Punilla';
    doc.text(title, pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(14);
    const subtitle = 'Estadistica de Emergencias';
    doc.text(subtitle, pageWidth / 2, 30, { align: 'center' });

    // Filtros 
    doc.setFontSize(12);
    doc.text("Filtros Aplicados:", 10, 45);
    doc.text(`Jefe de Dotación: ${filters.jefeDotacion || "Todos"}`, 10, 55);
    doc.text(`Tipo de Asistencia: ${filters.tipoAsistencia || "Todos"}`, 10, 65);
    doc.text(`Fecha Desde: ${filters.startDate || "Sin especificar"}`, 10, 75);
    doc.text(`Fecha Hasta: ${filters.endDate || "Sin especificar"}`, 10, 85);

    if (chartRef.current) {
      const chartCanvas = chartRef.current.canvas;
      const chartImage = chartCanvas.toDataURL('image/png');
      doc.addImage(chartImage, 'PNG', 10, 90, 180, 80);
    }

    // Análisis 
    doc.setFontSize(14);
    doc.text("Análisis de Datos:", 10, 180);
    doc.setFontSize(12);
    chartData.labels.forEach((label, index) => {
      const cantidad = chartData.datasets[0].data[index];
      doc.text(`- ${label}: ${cantidad} intervenciones`, 10, 190 + index * 10);
    });


    const printDate = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`Impreso el: ${printDate}`, 10, doc.internal.pageSize.getHeight() - 10);


    doc.save("Reporte_Emergencias.pdf");
  };

  return (
    <div className="reports-page">
      <h2>Estadistica de Emergencias</h2>

      <div className="filter-section">
        <label>
          Jefe de Dotación:
          <select name="jefeDotacion" onChange={handleFilterChange} value={filters.jefeDotacion}>
            <option value="">Todos</option>
            {jefesDotacion.map(jefe => (
              <option key={jefe.id} value={jefe.nombre_completo}>{jefe.nombre_completo}</option>
            ))}
          </select>
        </label>
        
        <label>
          Tipo de Asistencia:
          <select name="tipoAsistencia" onChange={handleFilterChange} value={filters.tipoAsistencia}>
            <option value="">Todos</option>
            <option value="Incendio">Incendio</option>
            <option value="Accidente">Accidente</option>
            <option value="Rescate">Rescate</option>
          </select>
        </label>

        <label>
          Fecha Desde:
          <input type="date" name="startDate" onChange={handleFilterChange} value={filters.startDate} />
        </label>

        <label>
          Fecha Hasta:
          <input type="date" name="endDate" onChange={handleFilterChange} value={filters.endDate} />
        </label>

        <button onClick={fetchReports} className="filter-btn">Aplicar Filtros</button>
      </div>

      <div className="chart-container">
        <h3>Intervenciones por Tipo</h3>
        {chartData.labels.length > 0 ? (
          <Bar ref={chartRef} data={chartData} options={{ responsive: true }} />
        ) : (
          <p>No hay datos disponibles para mostrar.</p>
        )}
      </div>

      <button onClick={generatePDF} className="generate-pdf-btn">Generar PDF del Reporte</button>
    </div>
  );
}

export default ReportsPage;