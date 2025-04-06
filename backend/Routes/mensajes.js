const express = require('express');
const router = express.Router();
const db = require('../DB/db.js');

// Obtener mensajes recibidos
router.get('/mensajes/recibidos/:legajo', (req, res) => {
  const legajo = req.params.legajo;
  const query = `
    SELECT m.id, CONCAT(p.nombre, ' ', p.apellido) AS remitente, m.asunto, m.cuerpo, m.fecha_envio, m.leido
    FROM mensajes m
    JOIN personal p ON m.remitente_id = p.legajo
    WHERE m.destinatario_id = ?
    ORDER BY m.fecha_envio DESC
  `;
  db.query(query, [legajo], (err, results) => {
    if (err) {
      console.error('Error al obtener mensajes recibidos:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json(results);
    }
  });
});

// Obtener mensajes enviados
router.get('/mensajes/enviados/:legajo', (req, res) => {
  const legajo = req.params.legajo;
  const query = `
    SELECT m.id, CONCAT(p.nombre, ' ', p.apellido) AS destinatario, m.asunto, m.cuerpo, m.fecha_envio
    FROM mensajes m
    JOIN personal p ON m.destinatario_id = p.legajo
    WHERE m.remitente_id = ?
    ORDER BY m.fecha_envio DESC
  `;
  db.query(query, [legajo], (err, results) => {
    if (err) {
      console.error('Error al obtener mensajes enviados:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json(results);
    }
  });
});

// Enviar mensaje
router.post('/mensajes/enviar', (req, res) => {
  const { remitente_id, destinatario_id, asunto, cuerpo } = req.body;
  const query = `
    INSERT INTO mensajes (remitente_id, destinatario_id, asunto, cuerpo)
    VALUES (?, ?, ?, ?)
  `;
  db.query(query, [remitente_id, destinatario_id, asunto, cuerpo], (err) => {
    if (err) {
      console.error('Error al enviar mensaje:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json({ success: true, message: 'Mensaje enviado' });
    }
  });
});

// Marcar como leído
router.put('/mensajes/marcar-leido/:id', (req, res) => {
  const { id } = req.params;
  const query = `UPDATE mensajes SET leido = 1 WHERE id = ?`;

  db.query(query, [id], (err) => {
    if (err) {
      console.error('Error al marcar mensaje como leído:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json({ success: true });
    }
  });
});

module.exports = router;