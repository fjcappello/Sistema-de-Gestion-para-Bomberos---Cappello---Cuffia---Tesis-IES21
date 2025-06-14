import React, { useEffect, useState } from 'react';
import api from '../api';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import jsPDF from 'jspdf';
import './Styles/estadisticasAsistencias.css';
import { useUsuario } from '../context/UserContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

function EstadisticaAsistencia() {
  const [ranking, setRanking] = useState([]);
  const [horas, setHoras] = useState([]);
  const [porDia, setPorDia] = useState([]);
  const [porMes, setPorMes] = useState([]);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [nombrePersonal, setNombrePersonal] = useState('');
  const [legajoFilter, setLegajoFilter] = useState(''); // Nuevo estado para filtro por legajo
  const [rankingAsistenciasMenos, setRankingAsistenciasMenos] = useState([]); // Para ranking "menos"
  const [rankingHorasMenos, setRankingHorasMenos] = useState([]); // Para ranking "menos"
  const [asistenciaPorJerarquia, setAsistenciaPorJerarquia] = useState([]); // Nuevo estado
  const [listaPersonal, setListaPersonal] = useState([]);
  const { usuario } = useUsuario();

  const fetchData = () => {
    const params = {};
    if (fechaDesde) params.desde = fechaDesde;
    if (fechaHasta) params.hasta = fechaHasta;
    if (nombrePersonal) params.nombre = nombrePersonal;
    if (legajoFilter) params.legajo = legajoFilter; // Añadir legajo a los parámetros

    // params.solo_personal = true; // Esta línea se elimina según cambios en backend

    console.log('Solicitando estadísticas con filtros:', params);

    // Top 5 Asistencias
    api.get('/ranking-asistencias', { params: { ...params, orden: 'desc', limite: 5 } })
      .then(res => setRanking(res.data))
      .catch(err => console.error('Error en /ranking-asistencias (Top 5)', err));

    // Bottom 5 Asistencias
    api.get('/ranking-asistencias', { params: { ...params, orden: 'asc', limite: 5 } })
      .then(res => setRankingAsistenciasMenos(res.data))
      .catch(err => console.error('Error en /ranking-asistencias (Bottom 5)', err));

    // Top 5 Horas
    api.get('/ranking-horas', { params: { ...params, orden: 'desc', limite: 5 } })
      .then(res => setHoras(res.data))
      .catch(err => console.error('Error en /ranking-horas (Top 5)', err));

    // Bottom 5 Horas
    api.get('/ranking-horas', { params: { ...params, orden: 'asc', limite: 5 } })
      .then(res => setRankingHorasMenos(res.data))
      .catch(err => console.error('Error en /ranking-horas (Bottom 5)', err));

    api.get('/asistencia-dia', { params })
      .then(res => setPorDia(res.data.data))
      .catch(err => console.error('Error en /asistencia-dia', err));

    api.get('/asistencia-mes', { params })
      .then(res => setPorMes(res.data.data))
      .catch(err => console.error('Error en /asistencia-mes', err));

    // Nueva llamada para Asistencia por Jerarquía
    api.get('/asistencia-jerarquia', { params })
      .then(res => setAsistenciaPorJerarquia(res.data))
      .catch(err => console.error('Error en /asistencia-jerarquia', err));
  };

  useEffect(() => {
    fetchData();
    api.get('/personal/nombres')
      .then(res => setListaPersonal(res.data.data))
      .catch(err => console.error('Error al cargar personal:', err));
    // eslint-disable-next-line
  }, []);

  const exportPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let y = margin;

    const img = new Image();
    img.src = '/images/logo.png';
    img.onload = () => {
      const imgWidth = 25;
      const imgHeight = (img.height * imgWidth) / img.width;
      const logoY = y;

      pdf.addImage(img, 'PNG', margin, logoY, imgWidth, imgHeight);
      pdf.setFontSize(18);
      pdf.text('Bomberos Santa María de Punilla', margin + imgWidth + 10, logoY + imgHeight / 2 + 5);

      y += imgHeight + 10;
      pdf.setFontSize(18);
      pdf.text('Estadísticas de Asistencia', pageWidth / 2, y, { align: 'center' });
      y += 10;
      pdf.setFontSize(12);
      pdf.text('Informe detallado de asistencia y horas trabajadas', pageWidth / 2, y, { align: 'center' });
      y += 15;

      pdf.setFontSize(11);
      if (fechaDesde || fechaHasta || nombrePersonal) {
        y += 5;
        pdf.text('Filtros aplicados:', margin, y);
        if (fechaDesde) {
          y += 5;
          pdf.text(`Desde: ${fechaDesde}`, margin + 5, y);
        }
        if (fechaHasta) {
          y += 5;
          pdf.text(`Hasta: ${fechaHasta}`, margin + 5, y);
        }
        if (nombrePersonal) {
          y += 5;
          pdf.text(`Personal: ${nombrePersonal}`, margin + 5, y);
        }
        if (legajoFilter) { // Asegurar que legajoFilter se incluye en el PDF
          y += 5;
          pdf.text(`Legajo: ${legajoFilter}`, margin + 5, y);
        }
        y += 5;
      }

      pdf.setFontSize(14);
      pdf.text('Ranking de Asistencias', margin, y);
      y += 8;
      pdf.setFontSize(10);
      pdf.text('Lista de personal ordenada por cantidad de asistencias.', margin, y);
      y += 8;

      ranking.forEach(item => {
        if (y > 270) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(`${item.nombre_completo}: ${item.cantidad} asistencias`, margin + 5, y);
        y += 6;
      });

      y += 10;
      pdf.setFontSize(14);
      pdf.text('Ranking por Horas en el Cuartel', margin, y);
      y += 8;
      pdf.setFontSize(10);
      pdf.text('Lista de personal ordenada por horas totales trabajadas.', margin, y);
      y += 8;

      horas.forEach(item => {
        if (y > 270) {
          pdf.addPage();
          y = margin;
        }
        const horasValor = Number(item.horas_totales);
        // Usa nombre_completo si está disponible, sino usa nombre (como fallback por si acaso)
        const nombreParaHoras = item.nombre_completo || item.nombre;
        pdf.text(`${nombreParaHoras}: ${isNaN(horasValor) ? '0.00' : horasValor.toFixed(2)} horas`, margin + 5, y);
        y += 6;
      });

      // PDF - Bottom 5 Asistencias
      y += 10;
      if (y > 260) { pdf.addPage(); y = margin; } // Control de página antes de sección
      pdf.setFontSize(14);
      pdf.text('Bottom 5 Personal con Menos Asistencias', margin, y);
      y += 8;
      pdf.setFontSize(10);
      pdf.text('Lista de personal con menos asistencias.', margin, y);
      y += 8;
      rankingAsistenciasMenos.forEach(item => {
        if (y > 270) { pdf.addPage(); y = margin; }
        pdf.text(`${item.nombre_completo}: ${item.cantidad} asistencias`, margin + 5, y);
        y += 6;
      });

      // PDF - Bottom 5 Horas
      y += 10;
      if (y > 260) { pdf.addPage(); y = margin; } // Control de página antes de sección
      pdf.setFontSize(14);
      pdf.text('Bottom 5 Personal con Menos Horas en el Cuartel', margin, y);
      y += 8;
      pdf.setFontSize(10);
      pdf.text('Lista de personal con menos horas totales trabajadas.', margin, y);
      y += 8;
      rankingHorasMenos.forEach(item => {
        if (y > 270) { pdf.addPage(); y = margin; }
        const horasValor = Number(item.horas_totales);
        pdf.text(`${item.nombre_completo}: ${isNaN(horasValor) ? '0.00' : horasValor.toFixed(2)} horas`, margin + 5, y);
        y += 6;
      });

      y += 10;
      if (y > 260) { pdf.addPage(); y = margin; } // Control de página antes de sección
      pdf.setFontSize(14);
      pdf.text('Asistencia por Día', margin, y);
      y += 8;
      pdf.setFontSize(10);
      pdf.text('Cantidad de ingresos por día en el período seleccionado.', margin, y);
      y += 8;

      porDia.forEach(item => {
        if (y > 270) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(`${item.dia}: ${item.cantidad} ingresos`, margin + 5, y);
        y += 6;
      });

      y += 10;
      pdf.setFontSize(14);
      pdf.text('Asistencia por Mes', margin, y);
      y += 8;
      pdf.setFontSize(10);
      pdf.text('Cantidad de ingresos por mes en el período seleccionado.', margin, y);
      y += 8;

      porMes.forEach(item => {
        if (y > 270) {
          pdf.addPage();
          y = margin;
        }
        pdf.text(`${item.mes}: ${item.cantidad} ingresos`, margin + 5, y);
        y += 6;
      });

      // PDF - Asistencia por Jerarquía
      if (y > 250) { // Check for page break before new section
          pdf.addPage();
          y = margin;
      }
      y += 10;
      pdf.setFontSize(14);
      pdf.text('Asistencia por Jerarquía', margin, y);
      y += 8;
      pdf.setFontSize(10);
      pdf.text('Distribución de asistencias según la jerarquía del personal.', margin, y);
      y += 8;

      if (asistenciaPorJerarquia.length > 0) {
        asistenciaPorJerarquia.forEach(item => {
          if (y > 270) { // Check for page break within items
            pdf.addPage();
            y = margin;
          }
          pdf.text(`${item.jerarquia_nombre}: ${item.cantidad} asistencias`, margin + 5, y);
          y += 6;
        });
      } else {
        pdf.text('No hay datos disponibles.', margin + 5, y);
        y += 6;
      }

      const footerText = `Generado por: ${usuario?.nombre || 'Usuario'} - Fecha: ${new Date().toLocaleDateString()}`;
      pdf.setFontSize(8);
      pdf.text(footerText, pageWidth / 2, 290, { align: 'center' });

      pdf.save(`Estadisticas_Asistencia_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
    };
  };

  const rankingData = {
    labels: ranking.map(item => item.nombre_completo),
    datasets: [
      {
        label: 'Cantidad de Asistencias',
        data: ranking.map(item => item.cantidad),
        backgroundColor: '#ff3333',
      },
    ],
  };

  const rankingOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
      title: { display: true, text: 'Top 5 Asistencias' } // Título actualizado
    },
    scales: {
      x: { title: { display: true, text: 'Personal' } }, // Eje X actualizado
      y: { beginAtZero: true, title: { display: true, text: 'Cantidad' } },
    },
  };

  const horasData = {
    labels: horas.map(item => item.nombre),
    datasets: [
      {
        label: 'Horas Totales',
        data: horas.map(item => item.horas_totales),
        backgroundColor: '#4CAF50',
      },
    ],
  };

  const horasOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
      title: { display: true, text: 'Top 5 Horas en Cuartel' } // Título actualizado
    },
    scales: {
      x: { title: { display: true, text: 'Personal' } }, // Eje X actualizado
      y: { beginAtZero: true, title: { display: true, text: 'Horas' } },
    },
  };

  const porDiaData = {
    labels: porDia.map(item => item.dia),
    datasets: [
      {
        label: 'Ingresos',
        data: porDia.map(item => item.cantidad),
        borderColor: '#8884d8',
        backgroundColor: '#8884d8',
        fill: false,
        tension: 0.4,
        pointRadius: 5,
      },
    ],
  };

  const porDiaOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
    },
    scales: {
      x: { title: { display: true, text: 'Día' } },
      y: { beginAtZero: true, title: { display: true, text: 'Cantidad' } },
    },
  };

  const porMesData = {
    labels: porMes.map(item => item.mes),
    datasets: [
      {
        label: 'Ingresos',
        data: porMes.map(item => item.cantidad),
        backgroundColor: '#ffc658',
      },
    ],
  };

  const porMesOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
    },
    scales: {
      x: { title: { display: true, text: 'Mes' } },
      y: { beginAtZero: true, title: { display: true, text: 'Cantidad' } },
    },
  };

  // Datos y opciones para Bottom 5 Asistencias
  const rankingAsistenciasMenosData = {
    labels: rankingAsistenciasMenos.map(item => item.nombre_completo),
    datasets: [
      {
        label: 'Cantidad de Asistencias',
        data: rankingAsistenciasMenos.map(item => item.cantidad),
        backgroundColor: '#ff9999', // Color diferente para Bottom 5
      },
    ],
  };

  const rankingAsistenciasMenosOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
      title: { display: true, text: 'Bottom 5 Asistencias' }
    },
    scales: {
      x: { title: { display: true, text: 'Personal' } },
      y: { beginAtZero: true, title: { display: true, text: 'Cantidad' } },
    },
  };

  // Datos y opciones para Bottom 5 Horas
  const rankingHorasMenosData = {
    labels: rankingHorasMenos.map(item => item.nombre_completo), // Asumiendo nombre_completo
    datasets: [
      {
        label: 'Horas Totales',
        data: rankingHorasMenos.map(item => parseFloat(item.horas_totales) || 0),
        backgroundColor: '#A5D6A7', // Color diferente para Bottom 5
      },
    ],
  };

  const rankingHorasMenosOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
      title: { display: true, text: 'Bottom 5 Horas en Cuartel' }
    },
    scales: {
      x: { title: { display: true, text: 'Personal' } },
      y: { beginAtZero: true, title: { display: true, text: 'Horas' } },
    },
  };

  // Datos y opciones para Asistencia por Jerarquía (Pie Chart)
  const jerarquiaChartData = {
    labels: asistenciaPorJerarquia.map(item => item.jerarquia_nombre),
    datasets: [
      {
        label: 'Cantidad de Asistencias',
        data: asistenciaPorJerarquia.map(item => item.cantidad),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          '#FFCD56', '#C9CBCF', '#3FC2E0', '#F672A7', '#COFFEE', '#BADA55'
          // Consider adding more diverse colors or a generator if many hierarchies
        ],
        hoverOffset: 4,
      },
    ],
  };

  const jerarquiaChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Asistencia por Jerarquía',
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div className="asistencia-stats-container">
      <div className="asistencia-filtros">
        <label className="filtro-fecha-desde">
          Desde:
          <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
        </label>
        <label className="filtro-fecha-hasta">
          Hasta:
          <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
        </label>
        <label className="filtro-personal-nombre">
          Personal:
          <select value={nombrePersonal} onChange={e => setNombrePersonal(e.target.value)}>
            <option value="">Todos</option>
            {listaPersonal.map(p => (
              <option key={p.id} value={p.nombre_completo}>
                {p.nombre_completo}
              </option>
            ))}
          </select>
        </label>
        <label className="filtro-legajo">
          Legajo:
          <input
            type="text"
            value={legajoFilter}
            onChange={e => setLegajoFilter(e.target.value)}
            placeholder="Filtrar por legajo"
          />
        </label>
        <button className="asistencia-filtrar-btn" onClick={fetchData}>
          Aplicar Filtros
        </button>
        <button
          className="asistencia-limpiar-btn"
          onClick={() => {
            setFechaDesde('');
            setFechaHasta('');
            setNombrePersonal('');
            setLegajoFilter(''); // Limpiar filtro de legajo
            fetchData();
          }}
        >
          Limpiar Filtros
        </button>
      </div>

      <div className="asistencia-exportar">
        <button className="asistencia-exportar-btn" onClick={exportPDF}>
          Exportar PDF
        </button>
      </div>

      <h2 className="asistencia-title">Estadísticas de Asistencia</h2>

      <div className="asistencia-section">
        <h3 className="asistencia-subtitle">Ranking de Asistencias</h3>
        <Bar data={rankingData} options={rankingOptions} />
      </div>

      <div className="asistencia-section">
        <h3 className="asistencia-subtitle">Ranking por Horas en el Cuartel</h3>
        <Bar data={horasData} options={horasOptions} />
      </div>

      <div className="asistencia-section">
        <h3 className="asistencia-subtitle">Bottom 5 Personal con Menos Asistencias</h3>
        <Bar data={rankingAsistenciasMenosData} options={rankingAsistenciasMenosOptions} />
      </div>

      <div className="asistencia-section">
        <h3 className="asistencia-subtitle">Bottom 5 Personal con Menos Horas en el Cuartel</h3>
        <Bar data={rankingHorasMenosData} options={rankingHorasMenosOptions} />
      </div>

      <div className="asistencia-section">
        <h3 className="asistencia-subtitle">Asistencia por Día</h3>
        <Line data={porDiaData} options={porDiaOptions} />
      </div>

      <div className="asistencia-section">
        <h3 className="asistencia-subtitle">Asistencia por Mes</h3>
        <Bar data={porMesData} options={porMesOptions} />
      </div>

      <div className="asistencia-section">
        <h3 className="asistencia-subtitle">Asistencia por Jerarquía</h3>
        {asistenciaPorJerarquia.length > 0 ? (
          <Pie data={jerarquiaChartData} options={jerarquiaChartOptions} />
        ) : (
          <p>No hay datos de asistencia por jerarquía para los filtros seleccionados.</p>
        )}
      </div>
    </div>
  );
}

export default EstadisticaAsistencia;