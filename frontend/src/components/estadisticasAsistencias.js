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
  const [legajoFilter, setLegajoFilter] = useState(''); 
  const [rankingAsistenciasMenos, setRankingAsistenciasMenos] = useState([]); 
  const [rankingHorasMenos, setRankingHorasMenos] = useState([]);
  const [asistenciaPorJerarquia, setAsistenciaPorJerarquia] = useState([]);
  const [listaPersonal, setListaPersonal] = useState([]);
  const { usuario } = useUsuario();

  const fetchData = () => {
    const params = {};
    if (fechaDesde) params.desde = fechaDesde;
    if (fechaHasta) params.hasta = fechaHasta;
    if (nombrePersonal) params.nombre = nombrePersonal;
    if (legajoFilter) params.legajo = legajoFilter; 

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
      .then(res => setPorDia(res.data))
      .catch(err => console.error('Error en /asistencia-dia', err));

    api.get('/asistencia-mes', { params })
      .then(res => setPorMes(res.data))
      .catch(err => console.error('Error en /asistencia-mes', err));

    // Nueva llamada para Asistencia por Jerarquía
    // api.get('/asistencia-jerarquia', { params })
    //   .then(res => setAsistenciaPorJerarquia(res.data))
    //   .catch(err => console.error('Error en /asistencia-jerarquia', err));
  };

  useEffect(() => {
    fetchData();
    api.get('/personal_nombres')
      .then(res => {
        console.log('Personal cargado:', res.data);
        setListaPersonal(res.data);
      })
      .catch(err => console.error('Error al cargar personal:', err));
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
        if (legajoFilter) { 
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
      if (y > 260) { pdf.addPage(); y = margin; } 
      pdf.setFontSize(14);
      pdf.text('Personal con Menos Asistencias', margin, y);
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
      if (y > 260) { pdf.addPage(); y = margin; } 
      pdf.setFontSize(14);
      pdf.text('Personal con Menos Horas en el Cuartel', margin, y);
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
      if (y > 260) { pdf.addPage(); y = margin; } 
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
      if (y > 250) { 
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
          if (y > 270) { 
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
      title: { display: true, text: 'Top 5 Asistencias' } 
    },
    scales: {
      x: { title: { display: true, text: 'Personal' } }, 
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
      title: { display: true, text: 'Top 5 Horas en Cuartel' } 
    },
    scales: {
      x: { title: { display: true, text: 'Personal' } }, 
      y: { beginAtZero: true, title: { display: true, text: 'Horas' } },
    },
  };

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sabado'];
  const porDiaData = {
    labels: porDia.map(item => diasSemana[new Date(item.dia).getDay()]),
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

  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const porMesData = {
    labels: porMes.map(item => {
      const [anio, mes] = item.mes.split('-'); 
      return `${meses[parseInt(mes, 10) - 1]} ${anio}`;
    }),
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

  // Datos y opciones para TOP 5 Asistencias
  const rankingAsistenciasMenosData = {
    labels: rankingAsistenciasMenos.map(item => item.nombre_completo),
    datasets: [
      {
        label: 'Cantidad de Asistencias',
        data: rankingAsistenciasMenos.map(item => item.cantidad),
        backgroundColor: '#ff9999', 
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

  // Datos y opciones para TOP 5 Horas
  const rankingHorasMenosData = {
    labels: rankingHorasMenos.map(item => item.nombre_completo), 
    datasets: [
      {
        label: 'Horas Totales',
        data: rankingHorasMenos.map(item => parseFloat(item.horas_totales) || 0),
        backgroundColor: '#A5D6A7'
      }
    ],
  };

  const rankingHorasMenosOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true },
      title: { display: true, text: 'Horas en Cuartel' }
    },
    scales: {
      x: { title: { display: true, text: 'Personal' } },
      y: { beginAtZero: true, title: { display: true, text: 'Horas' } },
    },
  };

  // Datos y opciones para Asistencia por Jerarquía 
  const jerarquiaChartData = {
    labels: asistenciaPorJerarquia.map(item => item.jerarquia_nombre),
    datasets: [
      {
        label: 'Cantidad de Asistencias',
        data: asistenciaPorJerarquia.map(item => item.cantidad),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
          '#FFCD56', '#C9CBCF', '#3FC2E0', '#F672A7', '#COFFEE', '#BADA55'
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
    <div className="table-container">
      <h2 className="table-title">Estadísticas de Asistencia</h2>
      <div className="botonera_tablas">
        <button className="add-report-btn" onClick={exportPDF}>
          Exportar PDF
        </button>
      </div>
      <div className="filtros">
        <label>
          Desde:
          <input type="date" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
        </label>
        <label>
          Hasta:
          <input type="date" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
        </label>
        <label>
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
        <label>
          Legajo:
          <input
            type="text"
            value={legajoFilter}
            onChange={e => setLegajoFilter(e.target.value)}
            placeholder="Filtrar por legajo"
          />
        </label>
        <button onClick={fetchData}>Aplicar Filtros</button>
        <button
          onClick={() => {
            setFechaDesde('');
            setFechaHasta('');
            setNombrePersonal('');
            setLegajoFilter('');
            fetchData();
          }}
        >
          Limpiar Filtros
        </button>
      </div>
      
      <div className='contenedor_graficos'>

      </div>


      <div className="asistencia-section">
        <h3 className="asistencia-subtitle">Ranking de Asistencias</h3>
        <Bar data={rankingData} options={rankingOptions} />
      </div>

      <div className="asistencia-section">
        <h3 className="asistencia-subtitle">Ranking por Horas en el Cuartel</h3>
        <Bar data={horasData} options={horasOptions} />
      </div>

      <div className="asistencia-section">
        <h3 className="asistencia-subtitle">Personal con Menos Asistencias</h3>
        <Bar data={rankingAsistenciasMenosData} options={rankingAsistenciasMenosOptions} />
      </div>

      <div className="asistencia-section">
        <h3 className="asistencia-subtitle">Personal con Menos Horas en el Cuartel</h3>
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

      {/*
      <div className="asistencia-section">
        <h3 className="asistencia-subtitle">Asistencia por Jerarquía</h3>
        {asistenciaPorJerarquia.length > 0 ? (
          <Pie data={jerarquiaChartData} options={jerarquiaChartOptions} />
        ) : (
          <p>No hay datos de asistencia por jerarquía para los filtros seleccionados.</p>
        )}
      </div>
      */}
    </div>
  );
}

export default EstadisticaAsistencia;