const express = require('express');
const router = express.Router();
const db = require('../DB/db.js');


// Obtener todos los registros de personal
router.get('/personal', (req, res) => {
  const query = `
    SELECT 
      p.legajo,
      CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo,
      p.documento,
      DATE_FORMAT(p.nacimiento, '%d-%m-%Y') AS nacimiento,
      DATE_FORMAT(p.fecha_ingreso, '%d-%m-%Y') AS fecha_ingreso,
      j.jerarquia AS jerarquia
    FROM personal p
    LEFT JOIN jerarquias j ON p.jerarquia_id = j.id
    ORDER BY p.legajo ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener datos de personal:', err);
      res.status(500).json({ error: 'Error en el servidor al obtener datos de personal' });
    } else {
      res.json(results);
    }
  });
});

// Obtener todas las jerarquías
router.get('/jerarquias', (req, res) => {
  const query = `SELECT id, jerarquia FROM jerarquias ORDER BY jerarquia ASC`;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener jerarquías:', err);
      res.status(500).json({ error: 'Error en el servidor al obtener jerarquías' });
    } else {
      res.json(results);
    }
  });
});


// Obtener nombres completos de personal
router.get('/personal_nombres', (req, res) => {
  const query = 'SELECT legajo AS id, CONCAT(nombre, " ", apellido) AS nombre_completo FROM personal';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener nombres de personal:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json(results);
    }
  });
});

// Insertar nuevo personal

router.post('/personal', (req, res) => {
  const { legajo, nombre, apellido, documento, nacimiento, fecha_ingreso, jerarquia_id } = req.body;

  const personalQuery = `
    INSERT INTO personal (legajo, nombre, apellido, documento, nacimiento, fecha_ingreso, jerarquia_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(personalQuery, [legajo, nombre, apellido, documento, nacimiento, fecha_ingreso, jerarquia_id], (err, result) => {
    if (err) {
      console.error('Error al agregar personal:', err);
      res.status(500).json({ error: 'Error en el servidor al agregar personal' });
      return;
    }

    const loginQuery = `
      INSERT INTO login (legajo, contraseña)
      VALUES (?, ?)
    `;

    db.query(loginQuery, [legajo, documento], (err) => {
      if (err) {
        console.error('Error al crear login:', err);
        res.status(500).json({ error: 'Error en el servidor al crear login' });
        return;
      }

      res.json({ success: 'Personal y login creados correctamente' });
    });
  });
});

// Borrar personal
router.delete('/personal/:legajo', (req, res) => {
  const { legajo } = req.params;
  const query = `DELETE FROM personal WHERE legajo = ?`;

  db.query(query, [legajo], (err, result) => {
    if (err) {
      console.error('Error al eliminar personal:', err);
      res.status(500).json({ error: 'Error en el servidor al eliminar personal' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Personal no encontrado' });
    } else {
      res.json({ success: 'Personal eliminado correctamente' });
    }
  });
});


module.exports = router;