const express = require('express');
const router = express.Router();
const db = require('../DB/db.js');

// Obtener mensajes recibidos
router.get('/mensajes/recibidos/:legajo', (req, res) => {
  const legajo = req.params.legajo;
  const query = `
    SELECT m.id, CONCAT(p.nombre, ' ', p.apellido) AS remitente, m.asunto, m.cuerpo, m.fecha_envio, md.leido
    FROM mensajes m
    JOIN personal p ON m.remitente_id = p.legajo
    JOIN mensaje_destinatarios md ON m.id = md.mensaje_id
    WHERE md.destinatario_id = ?
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
    SELECT m.id, CONCAT(p.nombre, ' ', p.apellido) AS destinatarios, m.asunto, m.cuerpo, m.fecha_envio
    FROM mensajes m
    JOIN mensaje_destinatarios md ON m.id = md.mensaje_id
    JOIN personal p ON md.destinatario_id = p.legajo
    WHERE m.remitente_id = ?
    GROUP BY m.id
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
  const { remitente_id, destinatarios, asunto, cuerpo } = req.body;
  const query = `
    INSERT INTO mensajes (remitente_id, asunto, cuerpo)
    VALUES (?, ?, ?)
  `;
  db.query(query, [remitente_id, asunto, cuerpo], (err, result) => {
    if (err) {
      console.error('Error al enviar mensaje:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      const mensajeId = result.insertId;
      const destinatarioQueries = destinatarios.map(destinatario_id => {
        return new Promise((resolve, reject) => {
          const insertQuery = `
            INSERT INTO mensaje_destinatarios (mensaje_id, destinatario_id)
            VALUES (?, ?)
          `;
          db.query(insertQuery, [mensajeId, destinatario_id], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      });

      Promise.all(destinatarioQueries)
        .then(() => {
          res.json({ success: true, message: 'Mensaje enviado' });
        })
        .catch(err => {
          console.error('Error al insertar destinatarios:', err);
          res.status(500).json({ error: 'Error en el servidor' });
        });
    }
  });
});

// Marcar como leído
router.put('/mensajes/marcar-leido/:id', (req, res) => {
  const { id } = req.params;
  const query = `UPDATE mensaje_destinatarios SET leido = 1 WHERE mensaje_id = ? AND destinatario_id = ?`;

  db.query(query, [id, req.body.destinatario_id], (err) => {
    if (err) {
      console.error('Error al marcar mensaje como leído:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json({ success: true });
    }
  });
});

module.exports = router;