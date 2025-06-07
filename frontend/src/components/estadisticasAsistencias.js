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
  const [listaPersonal, setListaPersonal] = useState([]);
  const { usuario } = useUsuario();

  const fetchData = () => {
    const params = {};
    if (fechaDesde) params.desde = fechaDesde;
    if (fechaHasta) params.hasta = fechaHasta;
    if (nombrePersonal) params.nombre = nombrePersonal;
    params.solo_personal = true;

    console.log('Solicitando estadísticas con filtros:', params);

    api.get('/ranking-asistencias', { params })
      .then(res => setRanking(res.data))
      .catch(err => console.error('Error en /ranking-asistencias', err));

    api.get('/ranking-horas', { params })
      .then(res => setHoras(res.data))
      .catch(err => console.error('Error en /ranking-horas', err));

    api.get('/asistencia-dia', { params })
      .then(res => setPorDia(res.data))
      .catch(err => console.error('Error en /asistencia-dia', err));

    api.get('/asistencia-mes', { params })
      .then(res => setPorMes(res.data))
      .catch(err => console.error('Error en /asistencia-mes', err));
  };

  useEffect(() => {
    fetchData();
    api.get('/personal/nombres')
      .then(res => setListaPersonal(res.data))
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
        pdf.text(`${item.nombre}: ${isNaN(horasValor) ? '0.00' : horasValor.toFixed(2)} horas`, margin + 5, y);
        y += 6;
      });

      y += 10;
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
    },
    scales: {
      x: { title: { display: true, text: '' } },
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
    },
    scales: {
      x: { title: { display: true, text: 'Nombre' } },
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
        <button className="asistencia-filtrar-btn" onClick={fetchData}>
          Aplicar Filtros
        </button>
        <button
          className="asistencia-limpiar-btn"
          onClick={() => {
            setFechaDesde('');
            setFechaHasta('');
            setNombrePersonal('');
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
        <h3 className="asistencia-subtitle">Asistencia por Día</h3>
        <Line data={porDiaData} options={porDiaOptions} />
      </div>

      <div className="asistencia-section">
        <h3 className="asistencia-subtitle">Asistencia por Mes</h3>
        <Bar data={porMesData} options={porMesOptions} />
      </div>
    </div>
  );
}

export default EstadisticaAsistencia;