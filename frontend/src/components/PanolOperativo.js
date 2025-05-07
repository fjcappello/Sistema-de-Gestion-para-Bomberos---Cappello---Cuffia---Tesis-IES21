import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './Styles/PanolOperativo.css';

function PanolOperativo() {
  const [elementos, setElementos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [estados, setEstados] = useState([]);

  // Filtros
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [textoFiltro, setTextoFiltro] = useState('');

  const [fechaIncorpoDesde, setFechaIncorpoDesde] = useState('');
  const [fechaIncorpoHasta, setFechaIncorpoHasta] = useState('');
  const [fechaVenciDesde, setFechaVenciDesde] = useState('');
  const [fechaVenciHasta, setFechaVenciHasta] = useState('');

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 6;

  useEffect(() => {
    axios.get(`http://localhost:3001/recuperar-elementosPanol`)
      .then(res => setElementos(res.data))
      .catch(error => console.error('Error cargando elementos:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3001/recuperar-tiposPanol')
      .then(res => setTipos(res.data))
      .catch(error => console.error('Error cargando tipos:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3001/recuperar-estadosPanol')
      .then(res => setEstados(res.data))
      .catch(error => console.error('Error cargando estados:', error));
  }, []);

  const elementosFiltrados = useMemo(() => {
    return elementos.filter(el => {
      const textoMatch =
        el.id_elemento.toString().includes(textoFiltro.toLowerCase()) ||
        el.elemento.toLowerCase().includes(textoFiltro.toLowerCase());

      const tipoMatch = tipoSeleccionado === '' || el.tipo === tipoSeleccionado;
      const estadoMatch = estadoSeleccionado === '' || el.estado === estadoSeleccionado;

      const incorpDate = el.f_incorporacion;
      const incorpDesdeOk = !fechaIncorpoDesde || incorpDate >= fechaIncorpoDesde;
      const incorpHastaOk = !fechaIncorpoHasta || incorpDate <= fechaIncorpoHasta;

      const venciDate = el.f_vencimiento;
      const venciDesdeOk = !fechaVenciDesde || venciDate >= fechaVenciDesde;
      const venciHastaOk = !fechaVenciHasta || venciDate <= fechaVenciHasta;

      return (
        textoMatch &&
        tipoMatch &&
        estadoMatch &&
        incorpDesdeOk &&
        incorpHastaOk &&
        venciDesdeOk &&
        venciHastaOk
      );
    });
  }, [
    elementos,
    textoFiltro,
    tipoSeleccionado,
    estadoSeleccionado,
    fechaIncorpoDesde,
    fechaIncorpoHasta,
    fechaVenciDesde,
    fechaVenciHasta
  ]);

  const totalPaginas = Math.ceil(elementosFiltrados.length / elementosPorPagina);

  const elementosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    const fin = inicio + elementosPorPagina;
    return elementosFiltrados.slice(inicio, fin);
  }, [paginaActual, elementosFiltrados]);

  const irPaginaAnterior = () => {
    if (paginaActual > 1) setPaginaActual(paginaActual - 1);
  };

  const irPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) setPaginaActual(paginaActual + 1);
  };

  const limpiarFiltros = () => {
    setTextoFiltro('');
    setTipoSeleccionado('');
    setEstadoSeleccionado('');
    setFechaIncorpoDesde('');
    setFechaIncorpoHasta('');
    setFechaVenciDesde('');
    setFechaVenciHasta('');
    setPaginaActual(1);
  };

  return (
    <div className="moviles-registro-container">
      <h2 className="moviles-registro-titulo">Pañol Operativo</h2>

      {/* FILTROS */}
      <div className="filtros">
        <input
          type="text"
          placeholder="Elemento o código"
          value={textoFiltro}
          onChange={(e) => {
            setTextoFiltro(e.target.value);
            setPaginaActual(1);
          }}
        />

        <select
          value={tipoSeleccionado}
          onChange={(e) => {
            setTipoSeleccionado(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="">Selecciona Tipo</option>
          {tipos.map((tipo) => (
            <option key={tipo.tipo} value={tipo.tipo}>
              {tipo.tipo}
            </option>
          ))}
        </select>

        <select
          value={estadoSeleccionado}
          onChange={(e) => {
            setEstadoSeleccionado(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="">Selecciona Estado</option>
          {estados.map((estado) => (
            <option key={estado.estado} value={estado.estado}>
              {estado.estado}
            </option>
          ))}
        </select>

        <div className="rango-fechas">
          <label>Incorporación desde:
            <input
              type="date"
              value={fechaIncorpoDesde}
              onChange={(e) => {
                setFechaIncorpoDesde(e.target.value);
                setPaginaActual(1);
              }}
            />
          </label>
          <label> hasta:
            <input
              type="date"
              value={fechaIncorpoHasta}
              onChange={(e) => {
                setFechaIncorpoHasta(e.target.value);
                setPaginaActual(1);
              }}
            />
          </label>
        </div>

        <div className="rango-fechas">
          <label>Vencimiento desde: 
            <input
              type="date"
              value={fechaVenciDesde}
              onChange={(e) => {
                setFechaVenciDesde(e.target.value);
                setPaginaActual(1);
              }}
            />
          </label>
          <label> hasta:
            <input
              type="date"
              value={fechaVenciHasta}
              onChange={(e) => {
                setFechaVenciHasta(e.target.value);
                setPaginaActual(1);
              }}
            />
          </label>
        </div>

        <button className="filtros-button" onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
        <button className="filtros-button" onClick={() => console.log("Exportando a excel")}>
          Exportar a Excel
        </button>
      </div>

      {/* TABLA */}
      <table className="moviles-registro-tabla">
        <thead>
          <tr>
            <th>Código</th>
            <th>Elemento</th>
            <th>Tipo</th>
            <th>Marca</th>
            <th>Incorporación</th>
            <th>Vencimiento</th>
            <th>Asignación</th>
            <th>F. asignación</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {elementosPaginados.map((el) => (
            <tr key={el.id_elemento}>
              <td>{el.id_elemento}</td>
              <td>{el.elemento}</td>
              <td>{el.tipo}</td>
              <td>{el.marca}</td>
              <td>{el.f_incorporacion}</td>
              <td>{el.f_vencimiento}</td>
              <td>{el.asignacion}</td>
              <td>{el.f_asignacion}</td>
              <td>{el.estado}</td>
              <td>
                <div>
                  <button className="tabla-boton">Modificar</button>
                  <button className="tabla-boton">Ver Foto</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINACIÓN */}
      <div className="paginacion">
        <button className="boton-paginacion" onClick={irPaginaAnterior} disabled={paginaActual === 1}>
          Anterior
        </button>

        <span className="pagina-actual">
          Página {paginaActual} de {totalPaginas}
        </span>

        <button className="boton-paginacion" onClick={irPaginaSiguiente} disabled={paginaActual === totalPaginas}>
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default PanolOperativo;
