const db = require('../DB/db.js');
const { registrarLog } = require('../Middlewares/logSeguridadLogger.js');

// Devuelve los mensajes recibidos por un usuario.
const obtenerMensajesRecibidos = (req, res) => {
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
};

// Devuelve los mensajes enviados por un usuario.
const obtenerMensajesEnviados = (req, res) => {
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
};

// Envía un mensaje con múltiples destinatarios.
const enviarMensaje = (req, res) => {
  const { remitente_id, destinatarios, asunto, cuerpo } = req.body;
  const query = `INSERT INTO mensajes (remitente_id, asunto, cuerpo) VALUES (?, ?, ?)`;

  db.query(query, [remitente_id, asunto, cuerpo], (err, result) => {
    if (err) {
      console.error('Error al enviar mensaje:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      const mensajeId = result.insertId;
      let pendientes = destinatarios.length;
      let errorOcurrido = false;

      destinatarios.forEach(destinatario_id => {
        const insertQuery = `INSERT INTO mensaje_destinatarios (mensaje_id, destinatario_id) VALUES (?, ?)`;
        db.query(insertQuery, [mensajeId, destinatario_id], (err) => {
          if (err && !errorOcurrido) {
            errorOcurrido = true;
            console.error('Error al insertar destinatarios:', err);
            res.status(500).json({ error: 'Error en el servidor' });
          } else {
            pendientes--;
            if (pendientes === 0 && !errorOcurrido) {
              registrarLog(remitente_id, `Envío de mensaje: asunto "${asunto}" enviado a ${destinatarios.length} destinatario(s)`);
              res.json({ success: true, message: 'Mensaje enviado' });
            }
          }
        });
      });
    }
  });
};

// Marca un mensaje como leído para el destinatario.
const marcarMensajeLeido = (req, res) => {
  const { id } = req.params;
  const { destinatario_id } = req.body;
  const query = `UPDATE mensaje_destinatarios SET leido = 1 WHERE mensaje_id = ? AND destinatario_id = ?`;

  db.query(query, [id, destinatario_id], (err) => {
    if (err) {
      console.error('Error al marcar mensaje como leído:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      registrarLog(destinatario_id, `Lectura de mensaje: mensaje ID ${id} marcado como leído`);
      res.json({ success: true });
    }
  });
};

module.exports = {
  obtenerMensajesRecibidos,
  obtenerMensajesEnviados,
  enviarMensaje,
  marcarMensajeLeido
};