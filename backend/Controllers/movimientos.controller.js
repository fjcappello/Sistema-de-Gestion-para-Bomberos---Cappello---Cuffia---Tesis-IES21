const db = require('../DB/db.js');
const { registrarBitacora } = require('../middlewares/bitacoraLogger');

// Obtener movimientos visibles
const obtenerMovimientos = (req, res) => {
  const query = `
    SELECT m.id, m.timestamp, m.nombre, m.apellido, m.dni, e.descripcion AS estado
    FROM movimientos_cuartel m
    JOIN estados_movimiento e ON m.estado_id = e.id
    WHERE m.visible = 1
    ORDER BY m.timestamp DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener movimientos:', err);
      return res.status(500).json({ error: 'Error al consultar movimientos' });
    }
    res.json(results);
  });
};

// Registrar nuevo movimiento
const registrarMovimiento = (req, res) => {
  const { id_personal, nombre, apellido, dni, estado_id } = req.body;

  const query = `
    INSERT INTO movimientos_cuartel (id_personal, nombre, apellido, dni, estado_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [id_personal || null, nombre, apellido, dni, estado_id], async (err, result) => {
    if (err) {
      console.error('Error al registrar movimiento:', err);
      return res.status(500).json({ error: 'Error al registrar movimiento' });
    }

    await registrarBitacora(
      id_personal || 0,
      'Registro de movimiento',
      `Se registró un ${estado_id === 1 ? 'ingreso' : 'egreso'} para ${nombre} ${apellido} (${dni})`
    );

    res.json({ success: true, id: result.insertId });
  });
};

// Ocultar un movimiento (soft delete)
const ocultarMovimiento = (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE movimientos_cuartel SET visible = 0 WHERE id = ?';

  db.query(query, [id], async (err, result) => {
    if (err) {
      console.error('Error al ocultar movimiento:', err);
      return res.status(500).json({ error: 'Error al ocultar movimiento' });
    }

    await registrarBitacora(
      0,
      'Ocultamiento de movimiento',
      `Se ocultó el movimiento ID ${id}`
    );

    res.json({ success: true });
  });
};

module.exports = {
  obtenerMovimientos,
  registrarMovimiento,
  ocultarMovimiento
};