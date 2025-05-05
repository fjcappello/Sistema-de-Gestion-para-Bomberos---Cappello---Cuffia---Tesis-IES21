import React from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './Styles/PanolOperativo.css'; 

function PanolOperativo() {
  return (
    <div class = "moviles-registro-container">
      <h2 class= "moviles-registro-titulo">Pañol Operativo</h2>

      {/* FILTROS */}
      <div className="filtros">
      
          <select>
            <option value="">Tipo</option>
            {/* Opciones dinámicas aquí */}
          </select>

          <label>Incorporación:</label>
          <input type="date" />

          <label>Vencimiento:</label>
          <input type="date" />

          <select>
            <option value="">Estado</option>
            {/* Opciones dinámicas aquí */}
          </select>

          <input type="text" placeholder="Elemento o código" />

          <button className="filtros-button">Aplicar filtros</button>
          <button className="filtros-button">Limpiar filtros</button>
          <button className="filtros-button">Exportar a Excel</button>
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
