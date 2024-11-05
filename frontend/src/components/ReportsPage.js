import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import PDFGenerator from './PDFGenerator';
import './ReportsPage.css';

function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const [showPDF, setShowPDF] = useState(false);
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

  useEffect(() => {
    const fetchJefes = async () => {
      try {
        const response = await axios.get('http://localhost:3001/personal_nombres');
        setJefesDotacion(response.data);
      } catch (err) {
        console.error("Error al cargar jefes:", err);
      }
    };
    fetchJefes();
  }, []);

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

  const handleSearch = async () => {
    setError('');
    setSearchResult(null);
    if (!searchTerm) {
      setError('Debe ingresar un ID o número de parte para buscar.');
      return;
    }
    try {
      const response = await axios.get(`http://localhost:3001/partesemergencias/${searchTerm}`);
      if (response.data) {
        setSearchResult(response.data);
      } else {
        setError('No se encontró el parte con el ID o número especificado.');
      }
    } catch (err) {
      console.error("Error al buscar el parte:", err);
      setError('Error en el servidor. Inténtelo más tarde.');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handlePrintPDF = () => {
    setShowPDF(true);
  };

  return (
    <div className="reports-page">
      <h2>Reportes de Emergencias</h2>

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
          <Bar data={chartData} options={{ responsive: true }} />
        ) : (
          <p>No hay datos disponibles para mostrar.</p>
        )}
      </div>

      <div className="search-container">
        <h3>Buscar e imprimir parte de emergencia</h3>
        <input
          type="text"
          placeholder="Buscar por ID o Número de Parte"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          required
        />
        <button onClick={handleSearch} className="search-btn">Buscar Parte</button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {searchResult && (
        <div className="report-result">
          <h3>Resultado del Parte</h3>
          <p><strong>ID Parte:</strong> {searchResult.parte_id}</p>
          <p><strong>Número de Parte:</strong> {searchResult.numero_parte}</p>
          <p><strong>Fecha:</strong> {searchResult.fecha}</p>
          <p><strong>Denunciante:</strong> {searchResult.nombre_denunciante} {searchResult.apellido_denunciante}</p>
          <p><strong>Documento:</strong> {searchResult.documento_denunciante}</p>
          <p><strong>Dirección:</strong> {searchResult.direccion}</p>
          <p><strong>Tipo de Asistencia:</strong> {searchResult.tipo_asistencia}</p>
          <p><strong>Jefe de Dotación:</strong> {searchResult.jefe_dotacion}</p>
          <p><strong>Información Adicional:</strong> {searchResult.parte_escrito}</p>
          <button onClick={handlePrintPDF} className="print-btn">Generar PDF</button>
        </div>
      )}

      {showPDF && <PDFGenerator partData={searchResult} onClose={() => setShowPDF(false)} />}
    </div>
  );
}

export default ReportsPage;