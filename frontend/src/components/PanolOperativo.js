import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './Styles/PanolOperativo.css';

function PanolOperativo() {
  const [elementos, setElementos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [asignacion, setAsignacion] = useState([]);

  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [textoFiltro, setTextoFiltro] = useState('');
  const [fechaIncorpoDesde, setFechaIncorpoDesde] = useState('');
  const [fechaIncorpoHasta, setFechaIncorpoHasta] = useState('');
  const [fechaVenciDesde, setFechaVenciDesde] = useState('');
  const [fechaVenciHasta, setFechaVenciHasta] = useState('');

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5;

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formulario, setFormulario] = useState({
    id_elemento: null,
    elemento: '',
    tipo: '',
    marca: '',
    f_incorporacion: '',
    f_vencimiento: '',
    asignacion: '',
    f_asignacion: '',
    estado: '',
  });

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

  useEffect(() => {
    axios.get(`http://localhost:3001/recuperar-marcasPanol`)
      .then(res => setMarcas(res.data))
      .catch(error => console.error('Error cargando elementos:', error));
  }, []);

  useEffect(() => {
    axios.get(`http://localhost:3001/recuperar-asignacionPanol`)
      .then(res => setAsignacion(res.data))
      .catch(error => console.error('Error cargando asignaciones:', error));
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

  const abrirModalNuevo = () => {
    setFormulario({
      id_elemento: null,
      elemento: '',
      tipo: '',
      marca: '',
      f_incorporacion: '',
      f_vencimiento: '',
      asignacion: '',
      f_asignacion: '',
      estado: '',
    });
    setModoEdicion(false);
    setModalAbierto(true);
  };

  const abrirModalEdicion = (el) => {
    setFormulario({
      id_elemento: el.id_elemento,
      elemento: el.elemento,
      tipo: el.tipo,
      marca: el.marca,
      f_incorporacion: el.f_incorporacion.split('T')[0],
      f_vencimiento: el.f_vencimiento ? el.f_vencimiento.split('T')[0] : '',
      asignacion: el.asignacion || '',
      f_asignacion: el.f_asignacion ? el.f_asignacion.split('T')[0] : '',
      estado: el.estado
    });
    setModoEdicion(true);
    setModalAbierto(true);
  };

  const guardarElemento = async () => {
    try {
      if (modoEdicion) {
        await axios.put(`http://localhost:3001/editar-elementoPanol/${formulario.id_elemento}`, {
          ...formulario
        });
        alert('Elemento modificado exitosamente.');
      } else {
        const res = await axios.post('http://localhost:3001/agregar-elementoPanol', {
          ...formulario
        });
        alert(`Elemento agregado. Código: ${res.data.id_insertado}`);
      }

      const nuevosDatos = await axios.get(`http://localhost:3001/recuperar-elementosPanol`);
      setElementos(nuevosDatos.data);
      setModalAbierto(false);
    } catch (error) {
      console.error('Error guardando el elemento:', error);
      alert('Ocurrió un error al guardar el elemento.');
    }
  };

  const exportarExcel = () => {
    const ws = XLSX.utils.json_to_sheet(elementosFiltrados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PañolOperativo");
    XLSX.writeFile(wb, "pañol_operativo.xlsx");
  };

  return (
    <div className="moviles-registro-container">
      <h2 className="moviles-registro-titulo">Pañol Operativo</h2>

      {/* Filtros */}
      <div className="filtros">
        <div className="filtro-group">
          <label>Buscar:</label>
          <input
            type="text"
            value={textoFiltro}
            onChange={(e) => setTextoFiltro(e.target.value)}
            placeholder="Código o nombre"
          />
        </div>

        <div className="filtro-group">
          <label>Tipo:</label>
          <select
            value={tipoSeleccionado}
            onChange={(e) => setTipoSeleccionado(e.target.value)}
          >
            <option value="">Todos</option>
            {tipos.map(tipo => (
              <option key={tipo.id_tipo} value={tipo.tipo}>{tipo.tipo}</option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label>Estado:</label>
          <select
            value={estadoSeleccionado}
            onChange={(e) => setEstadoSeleccionado(e.target.value)}
          >
            <option value="">Todos</option>
            {estados.map(estado => (
              <option key={estado.id_estado} value={estado.estado}>{estado.estado}</option>
            ))}
          </select>
        </div>

        <div className="filtro-group">
          <label>Incorp. desde:</label>
          <input
            type="date"
            value={fechaIncorpoDesde}
            onChange={(e) => setFechaIncorpoDesde(e.target.value)}
          />
        </div>

        <div className="filtro-group">
          <label>Incorp. hasta:</label>
          <input
            type="date"
            value={fechaIncorpoHasta}
            onChange={(e) => setFechaIncorpoHasta(e.target.value)}
          />
        </div>

        <div className="filtro-group">
          <label>Venc. desde:</label>
          <input
            type="date"
            value={fechaVenciDesde}
            onChange={(e) => setFechaVenciDesde(e.target.value)}
          />
        </div>

        <div className="filtro-group">
          <label>Venc. hasta:</label>
          <input
            type="date"
            value={fechaVenciHasta}
            onChange={(e) => setFechaVenciHasta(e.target.value)}
          />
        </div>

        <button className="filtros-button" onClick={limpiarFiltros}>Limpiar filtros</button>
        <button className="filtros-button" onClick={exportarExcel}>Exportar a Excel</button>
      </div>

      {/* Tabla */}
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
              <td>{el.f_vencimiento || '-'}</td>
              <td>{el.asignacion || '-'}</td>
              <td>{el.f_asignacion || '-'}</td>
              <td>{el.estado}</td>
              <td>
                <button className="boton-accion-mod" onClick={() => abrirModalEdicion(el)}>Modificar</button>
                <button className="boton-accion-mod">Ver Foto</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="paginacion">
        <button 
          className="boton-paginacion" 
          onClick={irPaginaAnterior} 
          disabled={paginaActual === 1}
        >
          Anterior
        </button>
        <span className="pagina-actual">Página {paginaActual} de {totalPaginas}</span>
        <button 
          className="boton-paginacion" 
          onClick={irPaginaSiguiente} 
          disabled={paginaActual === totalPaginas}
        >
          Siguiente
        </button>
      </div>

      {/* Botón agregar */}
      <div className="action-buttons">
        <button className="add-report-btn" onClick={abrirModalNuevo}>Agregar elemento</button>
      </div>

      {/* Modal reutilizable */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">{modoEdicion ? 'Editar Elemento' : 'Agregar Nuevo Elemento'}</h3>
            <form className="form-container" onSubmit={(e) => { e.preventDefault(); guardarElemento(); }}>
              <div className="form-group">
                <label>Elemento:</label>
                <input 
                  type="text" 
                  value={formulario.elemento}
                  onChange={(e) => setFormulario({...formulario, elemento: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Tipo:</label>
                <select
                  value={formulario.tipo}
                  onChange={(e) => setFormulario({...formulario, tipo: e.target.value})}
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  {tipos.map(tipo => (
                    <option key={tipo.id_tipo} value={tipo.tipo}>{tipo.tipo}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Marca:</label>
                <select
                  value={formulario.marca}
                  onChange={(e) => setFormulario({...formulario, marca: e.target.value})}
                  required
                >
                  <option value="">Seleccione una marca</option>
                  {marcas.map(marca => (
                    <option key={marca.id_marca} value={marca.marca}>{marca.marca}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Fecha Incorporación:</label>
                <input 
                  type="date" 
                  value={formulario.f_incorporacion}
                  onChange={(e) => setFormulario({...formulario, f_incorporacion: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Fecha Vencimiento:</label>
                <input 
                  type="date" 
                  value={formulario.f_vencimiento}
                  onChange={(e) => setFormulario({...formulario, f_vencimiento: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Asignación:</label>
                <input 
                  type="text" 
                  value={formulario.asignacion}
                  onChange={(e) => setFormulario({...formulario, asignacion: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Fecha Asignación:</label>
                <input 
                  type="date" 
                  value={formulario.f_asignacion}
                  onChange={(e) => setFormulario({...formulario, f_asignacion: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Estado:</label>
                <select
                  value={formulario.estado}
                  onChange={(e) => setFormulario({...formulario, estado: e.target.value})}
                  required
                >
                  <option value="">Seleccione un estado</option>
                  {estados.map(estado => (
                    <option key={estado.id_estado} value={estado.estado}>{estado.estado}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="confirm-btn">
                  {modoEdicion ? 'Guardar Cambios' : 'Agregar'}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PanolOperativo;