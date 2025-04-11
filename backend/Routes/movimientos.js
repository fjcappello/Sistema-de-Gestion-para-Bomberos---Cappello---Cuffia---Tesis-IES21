const express = require('express');
const router = express.Router();
const db = require('../DB/db.js');

router.get('/movimientos_cuartel', (req, res) => {
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

router.put('/movimientos_cuartel/:id/ocultar', (req, res) => {
  const { id } = req.params;
  const query = 'UPDATE movimientos_cuartel SET visible = 0 WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al ocultar movimiento:', err);
      return res.status(500).json({ error: 'Error al ocultar movimiento' });
    }
    res.json({ success: true });
  });
});

module.exports = router;
