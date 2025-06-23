import React, { useEffect, useState, useMemo } from 'react';
import api from '../api';
import * as XLSX from 'xlsx';
import './Styles/PanolOperativo.css';
import './Styles/Tablas.css';
import { useUsuario } from '../context/UserContext';

function PanolOperativo() {
  const [elementos, setElementos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const { usuario } = useUsuario();
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('');
  const [textoFiltro, setTextoFiltro] = useState('');
  const [fechaIncorpoDesde, setFechaIncorpoDesde] = useState('');
  const [fechaIncorpoHasta, setFechaIncorpoHasta] = useState('');
  const [fechaVenciDesde, setFechaVenciDesde] = useState('');
  const [fechaVenciHasta, setFechaVenciHasta] = useState('');

  //HOOKS para Paginar
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5;

  //HOOKS para Agregar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [formulario, setFormulario] = useState({
    elemento: '',
    tipo: '',
    marca: '',
    f_incorporacion: '',
    f_vencimiento: '',
    asignacion: '',
    f_asignacion: '',
    estado: '',
  });

  //HOOKS para Editar
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [elementoEditar, setElementoEditar] = useState(null);
  const [imagenActiva, setImagenActiva] = useState(true);
  const [ImagenContenido, setImagenContenido] = useState('');

  //HOOKS para visualizar foto de baja
  const [modalFotoAbierto, setModalFotoAbierto] = useState(false);
  const [fotoUrl, setFotoUrl] = useState('');


  useEffect(() => {
    api.get("/recuperar-elementosPanol")
      .then(res => setElementos(res.data))
      .catch(error => console.error('Error cargando elementos:', error));
  }, []);

  useEffect(() => {
    api.get("/recuperar-tiposPanol")
      .then(res => setTipos(res.data))
      .catch(error => console.error('Error cargando tipos:', error));
  }, []);

  useEffect(() => {
    api.get("/recuperar-estadosPanol")
      .then(res => setEstados(res.data))
      .catch(error => console.error('Error cargando estados:', error));
  }, []);

  useEffect(() => {
    api.get("/recuperar-marcasPanol")
      .then(res => setMarcas(res.data))
      .catch(error => console.error('Error cargando elementos:', error));
  }, []);

  useEffect(() => {
    api.get("/recuperar-asignacionPanol")
      .then(res => setAsignaciones(res.data))
      .catch(error => console.error('Error cargando elementos:', error));
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

  const crearElemento = async () => {
    try {
      const response = await api.post('/agregar-elementoPanol', {
        elemento: formulario.elemento,
        id_tipo: formulario.tipo,
        id_marca: formulario.marca,
        f_incorporacion: formulario.f_incorporacion,
        f_vencimiento: formulario.f_vencimiento,
        id_asignacion: formulario.asignacion,
        f_asignacion: formulario.f_asignacion,
        id_estado: formulario.estado
      });
      alert(`Se ha agregado el elemento exitosamente. Código: ${response.data.id_insertado}`);
      if (response.status === 200) {
        const nuevosDatos = await api.get('/recuperar-elementosPanol');
        setElementos(nuevosDatos.data);
        setModalAbierto(false);
        setFormulario({
          elemento: '',
          tipo: '',
          marca: '',
          f_incorporacion: '',
          f_vencimiento: '',
          asignacion: '',
          f_asignacion: '',
          estado: '',
        });
      }
    } catch (error) {
      console.error('Error al agregar el elemento:', error);
      alert('Ocurrió un error al intentar agregar el elemento.');
    }
  };

  const exportarAExcel = () => {
  const hoja = XLSX.utils.json_to_sheet(elementosFiltrados);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Pañol Operativo');
  const ahora = new Date();
  const fechaFormateada = ahora.toISOString().slice(0, 19).replace(/[:T]/g, '-'); // ej: 2025-05-10-14-30-00
  const nombreArchivo = `PañolOperativo_${fechaFormateada}.xlsx`;
  XLSX.writeFile(libro, nombreArchivo);
  };


  //Funcion para manejar el envio del formulario
  const handleEditarElemento = (e) => {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario

    const form = e.target.closest("form");

    const formulario = {
      id_elemento: elementoEditar.id_elemento,
      asignacion: form.id_asignacion.value,
      f_asignacion: form.f_asignacion.value,
      estado: form.id_estado.value,
    };

    // Validación: si el estado es BAJA (3) y no hay imagen cargada
    if (parseInt(formulario.estado) === 3 && !ImagenContenido) {
      alert("Debe subir una imagen para dar de baja el elemento.");
      return;
    }

    editarElemento(formulario, ImagenContenido);
  };

  //Función para activar/desactivar input de imagen según estado
  const activadorImagenes = (valor) => {
    const estadoSeleccionado = Number(valor);
    if (estadoSeleccionado === 3) {
      setImagenActiva(false);
    } else {
      setImagenActiva(true);
      const inputFile = document.getElementById("foto");
      if (inputFile) {
        inputFile.value = "";
      }
      setImagenContenido(""); 
    }
  };

  //Función para guardar cambios en un elemento
  const editarElemento = async (formulario, ImagenContenido) => {
    try {
      const formData = new FormData();

      formData.append("id_elemento", formulario.id_elemento);
      formData.append("id_asignacion", formulario.asignacion);
      formData.append("f_asignacion", formulario.f_asignacion);
      formData.append("id_estado", formulario.estado);

      // Solo incluir imagen si el estado es BAJA (id 3) y hay imagen cargada
      if (parseInt(formulario.estado) === 3 && ImagenContenido) {
        formData.append("foto", ImagenContenido);
      }
      const response = await api.put(
        `/cambiar-estadosPanol`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        alert("Elemento editado exitosamente.");
        const nuevosDatos = await api.get("/recuperar-elementosPanol");
        setElementos(nuevosDatos.data);
        setModalEditarAbierto(false);
        setImagenContenido("");
        setImagenActiva(false);
      }
    } catch (error) {
      console.error("Error al editar el elemento:", error);
      alert("Ocurrió un error al intentar editar el elemento.");
    }
  };

  //Funcion para cerrar modal de edicion
  const cerrarModalEditar = () => {
    setImagenContenido(""); 
    setImagenActiva(true); 
    setElementoEditar(null);
    const inputFile = document.getElementById("foto");
    if (inputFile) inputFile.value = ""; 
    setModalEditarAbierto(false);
  };

  

  return (
    <div className="moviles-registro-container">
      <h2 className="moviles-registro-titulo">Pañol Operativo</h2>

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
        <button className="filtros-button" onClick={exportarAExcel}>
          Exportar a Excel
        </button>
      </div>

      <table className="table-fluent">
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
            {["Administrador", "Jefatura"].includes(usuario?.rol) && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {elementosPaginados.map((el) => (
            <tr
              key={el.id_elemento}
              className={el.estado === "Baja" ? "vencida" : ""}
              title={el.estado === "Baja" ? "Elemento dado de baja" : ""}
            >
              <td>{el.id_elemento}</td>
              <td>{el.elemento}</td>
              <td>{el.tipo}</td>
              <td>{el.marca}</td>
              <td>{el.f_incorporacion}</td>
              <td>{el.f_vencimiento}</td>
              <td>{el.asignacion}</td>
              <td>{el.f_asignacion}</td>
              <td>{el.estado}</td>
              {["Administrador", "Jefatura"].includes(usuario?.rol) && (
                <td>
                  <div>
                    <button className="boton-accion-mod" onClick={() => {setElementoEditar(el); setModalEditarAbierto(true);}} disabled={el.estado === "Baja"}>Modificar</button>
                    <button className="boton-accion-mod" disabled={el.estado !== "Baja"} onClick={() => {setFotoUrl(`${import.meta.env.VITE_API_URL}/${el.foto}`);setModalFotoAbierto(true);}}>Ver foto</button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

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

      <div className="action-buttons">
        {["Administrador", "Jefatura"].includes(usuario?.rol) && (
          <button className="add-report-btn" onClick={() => setModalAbierto(true)}>
            Agregar elemento
          </button>
        )}
      </div>

      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Agregar Nuevo Elemento</h3>
            <form className="form-container" onSubmit={(e) => { e.preventDefault(); crearElemento(); }}>
              <input
                name="elemento"
                placeholder="Elemento"
                value={formulario.elemento}
                onChange={(e) => setFormulario({ ...formulario, elemento: e.target.value })}
                required
              />

              <select
                value={formulario.tipo}
                onChange={(e) => setFormulario({ ...formulario, tipo: e.target.value })}
                required
              >
                <option value="">Seleccione un tipo</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id_tipo} value={tipo.id_tipo}>
                    {tipo.tipo}
                  </option>
                ))}
              </select>

              <select
                value={formulario.marca}
                onChange={(e) => setFormulario({ ...formulario, marca: e.target.value })}
                required
              >
                <option value="">Seleccione una marca</option>
                {marcas.map((marca) => (
                  <option key={marca.id_marca} value={marca.id_marca}>
                    {marca.marca}
                  </option>
                ))}
              </select>

              <label>Fecha de Incorporación:</label>
              <input
                type="date"
                name="f_incorporacion"
                value={formulario.f_incorporacion}
                onChange={(e) => setFormulario({ ...formulario, f_incorporacion: e.target.value })}
                required
              />

              <label>Fecha de Vencimiento:</label>
              <input
                type="date"
                name="f_vencimiento"
                value={formulario.f_vencimiento}
                onChange={(e) => setFormulario({ ...formulario, f_vencimiento: e.target.value })}
              />

              <select
                name="asignacion"
                value={formulario.asignacion}
                onChange={(e) => setFormulario({ ...formulario, asignacion: e.target.value })}
              >
                <option value="" disabled>Seleccione un lugar</option>
                {asignaciones.map((asignacion) => (
                  <option key={asignacion.id_asignacion} value={asignacion.id_asignacion}>
                    {asignacion.asignacion}
                  </option>
                ))}
              </select>

              <label>Fecha de Asignación:</label>
              <input
                type="date"
                name="f_asignacion"
                value={formulario.f_asignacion}
                onChange={(e) => setFormulario({ ...formulario, f_asignacion: e.target.value })}
              />

              <select
                value={formulario.estado}
                onChange={(e) => setFormulario({ ...formulario, estado: e.target.value })}
                required
              >
                <option value="">Seleccione un estado</option>
                {estados.map((estado) => (
                  <option key={estado.id_estado} value={estado.id_estado}>
                    {estado.estado}
                  </option>
                ))}
              </select>

              <div className="form-buttons">
                <button type="submit" className="confirm-btn">
                  Agregar
                </button>
                <button type="button" className="cancel-btn" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {modalEditarAbierto && elementoEditar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Editar Elemento</h3>
            <form className="form-container" onSubmit={(e) => { e.preventDefault();}}>
              <p>Elemento:</p>
              <input type="text" name="elemento" value={elementoEditar.elemento} readOnly />

              <p>ID Elemento:</p>
              <input type="text" name="id_elemento" value={elementoEditar.id_elemento} readOnly />

              <p>Asignado en:</p>
              <select name="id_asignacion" required defaultValue={
                asignaciones.find(a => a.asignacion === elementoEditar.asignacion)?.id_asignacion || ""
              }>
                {asignaciones.map((asignacion) => (
                  <option key={asignacion.id_asignacion} value={asignacion.id_asignacion}>
                    {asignacion.asignacion}
                  </option>
                ))}
              </select>


              <p>Fecha de asignación:</p>
              <input type="date" name="f_asignacion" required defaultValue={elementoEditar.f_asignacion} />

              <p>Estado:</p>
              <select name="id_estado" required defaultValue={
                estados.find(e => e.estado === elementoEditar.estado)?.id_estado || ""} onChange={(e) => activadorImagenes(e.target.value)}>
                {estados.map((estado) => (
                  <option key={estado.id_estado} value={estado.id_estado}>
                    {estado.estado}
                  </option>
                ))}
              </select>

              <p>Imagen de baja</p>
              <input type="file" id="foto" name="foto" accept="image/*" disabled={imagenActiva}onChange={(e) => setImagenContenido(e.target.files[0])}/>

              <div className="form-buttons">
                <button type="submit" className="confirm-btn" onClick={handleEditarElemento}>Guardar Cambios</button>
                <button type="button" className="cancel-btn" onClick={cerrarModalEditar}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Foto de Baja */}
      {modalFotoAbierto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Foto de Baja</h3>
            <div className="foto-container modal-foto">
              <img src={fotoUrl} alt="Foto de Baja" className="foto-baja" />
            </div>
            <div className="form-buttons">
              <button type="button" className="cancel-btn" onClick={() => setModalFotoAbierto(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 



export default PanolOperativo;

