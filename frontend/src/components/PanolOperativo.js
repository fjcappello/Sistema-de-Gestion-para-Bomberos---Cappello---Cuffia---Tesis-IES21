import React, { useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './Styles/PanolOperativo.css'; 


function PanolOperativo() {
  const [elementos, setElementos] = useState([]);
  const [elementosFiltrados, setElementosFiltrados] = useState([]);
  const [elementoSeleccionado, setElementoSeleccionado] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState([]);
  const [estados, setEstados] = useState([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState([]);
  const [fechaIncorpoSeleccionada, setfechaIncorpoSeleccionada] = useState('');
  const [fechaVenciSeleccionada, setfechaVenciSeleccionada] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:3001/recuperar-elementosPanol`)
      .then(res => {
        console.log('Elementos cargados:', res.data);
        setElementos(res.data);
      })
      .catch(error => console.error('Error cargando elementos:', error));
  }, []);


  function cargarElementosGrilla(){

  }

  //Cargar tipos
  useEffect(() => {
    axios.get('http://localhost:3001/recuperar-tiposPanol')
      .then(res => setTipos(res.data))
      .catch(error => console.error('Error cargando tipos de elemntos:', error));
  }, []);

  //Cargar estados
  useEffect(() => {
    axios.get('http://localhost:3001/recuperar-estadosPanol')
      .then(res => setEstados(res.data))
      .catch(error => console.error('Error cargando estados de elemntos:', error));
  }, []);


  return (
    <div class = "moviles-registro-container">
      <h2 class= "moviles-registro-titulo">Pañol Operativo</h2>

      {/* FILTROS */}
      <div className="filtros">
        <input type="text" name = "texto" placeholder="Elemento o código"/>

        <select value={tipoSeleccionado} onChange={(e) => setTipoSeleccionado(e.target.value)}>
          <option value="" name="tipo">Selecciona Tipo</option>
          {tipos.map((tipo) => (
              <option 
                key={tipo.tipo} 
                value={tipo.id_tipo.toString()}
              >
                {tipo.tipo}
              </option>
            ))}
        </select>

        <select value={estadoSeleccionado} onChange={(e) => setEstadoSeleccionado(e.target.value)}>
          <option value="" name="estado">Selecciona Estado</option>
          {estados.map((estado) => (
              <option 
                key={estado.estado} 
                value={estado.id_estado.toString()}
              >
                {estado.estado}
              </option>
            ))}
        </select>

        <label>Incorporación:
          <input type="date" name="fincorp" onChange={(e) => setfechaIncorpoSeleccionada(e.target.value)} value={fechaIncorpoSeleccionada}/>
        </label>
        <label>Vencimiento:
          <input type="date" name="fvenc" onChange={(e) => setfechaVenciSeleccionada(e.target.value)} value={fechaIncorpoSeleccionada}/>
        </label>
        <button className="filtros-button" onClick={console.log("Limpiando filtros")}>Limpiar filtros</button>
        <button className="filtros-button" onClick={console.log("Exportando a excel")}>Exportar a Excel</button>
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
            <th>Foto</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {/* Aquí iría el mapeo de los datos */}
          {elementos.map((el) => (
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
          </tr>
        ))}
        </tbody>
      </table>

      {/* PAGINACIÓN */}
      <div className="paginacion">
        <button className="boton-paginacion">
          Anterior
        </button>

        <span className="pagina-actual">
          Página 1 de 5
        </span>

        <button className="boton-paginacion">
          Siguiente
        </button>
      </div>
    </div>
  );
};


export default PanolOperativo;
