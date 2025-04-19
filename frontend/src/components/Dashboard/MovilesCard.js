

import React from 'react';

function MovilesCard() {
  return (
    <div>
      <h3>Móviles Registrados</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Interno</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Dominio</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>01</td>
            <td>Ford</td>
            <td>Ranger</td>
            <td>AB123CD</td>
          </tr>
          <tr>
            <td>02</td>
            <td>Mercedes</td>
            <td>Sprinter</td>
            <td>CD456EF</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default MovilesCard;