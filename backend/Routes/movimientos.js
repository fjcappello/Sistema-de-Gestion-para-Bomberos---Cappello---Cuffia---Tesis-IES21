const express = require('express');
const router = express.Router();
const db = require('../DB/db.js');



router.get('/movimientos_cuartel', (req, res) => {
  const query = `
    SELECT m.id, m.timestamp, m.nombre, m.apellido, m.dni, e.descripcion AS estado
    FROM movimientos_cuartel m
    JOIN estados_movimiento e ON m.estado_id = e.id
    ORDER BY m.timestamp DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener movimientos:', err);
      return res.status(500).json({ error: 'Error al consultar movimientos' });
    }
    res.json(results);
  });
});

router.post('/movimientos_cuartel', (req, res) => {
  const { id_personal, nombre, apellido, dni, estado_id } = req.body;

  const query = `
    INSERT INTO movimientos_cuartel (id_personal, nombre, apellido, dni, estado_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [id_personal || null, nombre, apellido, dni, estado_id], (err, result) => {
    if (err) {
      console.error('Error al registrar movimiento:', err);
      return res.status(500).json({ error: 'Error al registrar movimiento' });
    }
    res.json({ success: true, id: result.insertId });
  });
});

module.exports = router;
