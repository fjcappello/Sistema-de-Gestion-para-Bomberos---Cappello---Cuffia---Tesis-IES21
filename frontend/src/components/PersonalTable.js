import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PersonalTable.css';

function PersonalTable() {
  const [personal, setPersonal] = useState([]);

  useEffect(() => {
    const fetchPersonal = async () => {
      try {
        const response = await axios.get('http://localhost:3001/personal');
        setPersonal(response.data);
      } catch (error) {
        console.error("Error al obtener datos de personal:", error);
      }
    };

    fetchPersonal();
  }, []);

  return (
    <table className="personal-table">
      <thead>
        <tr>
          <th>Legajo</th>
          <th>Nombre y Apellido</th>
          <th>Documento</th>
          <th>Fecha de nacimiento</th>
          <th>Fecha de ingreso</th>
          <th>Jerarquía</th>
        </tr>
      </thead>
      <tbody>
        {personal.length > 0 ? (
          personal.map((rrhh) => (
            <tr key={rrhh.legajo}>
              <td>{rrhh.legajo}</td>
              <td>{rrhh.nombre_completo}</td>
              <td>{rrhh.documento}</td>
              <td>{rrhh.nacimiento}</td>
              <td>{rrhh.fecha_ingreso}</td>
              <td>{rrhh.jerarquia}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6">No hay datos de personal disponibles</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default PersonalTable;