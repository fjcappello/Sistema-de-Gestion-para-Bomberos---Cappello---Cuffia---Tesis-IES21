const db = require("../DB/db.js");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

// Obtener mensajes recibidos
const obtenerMensajesRecibidos = (req, res) => {
  const legajo = req.params.legajo;
  const query = `
    SELECT m.id, CONCAT(p.nombre, ' ', p.apellido) AS remitente, m.asunto, m.cuerpo, m.fecha_envio, md.leido
    FROM mensajes m
    JOIN personal p ON m.legajo_remitente = p.legajo
    JOIN mensaje_destinatarios md ON m.id = md.mensaje_id
    WHERE md.legajo_destinatario = ?
    ORDER BY m.fecha_envio DESC
  `;
  db.query(query, [legajo], (err, results) => {
    if (err) {
      console.error("Error al obtener mensajes recibidos:", err);
      res.status(500).json({ error: "Error en el servidor" });
    } else {
      res.json(results);
    }
  });
};

// Obtener mensajes enviados
const obtenerMensajesEnviados = (req, res) => {
  const legajo = req.params.legajo;
  const query = `
    SELECT m.id, CONCAT(p.nombre, ' ', p.apellido) AS destinatarios, m.asunto, m.cuerpo, m.fecha_envio
    FROM mensajes m
    JOIN mensaje_destinatarios md ON m.id = md.mensaje_id
    JOIN personal p ON md.legajo_destinatario = p.legajo
    WHERE m.legajo_remitente = ?
    GROUP BY m.id
    ORDER BY m.fecha_envio DESC
  `;
  db.query(query, [legajo], (err, results) => {
    if (err) {
      console.error("Error al obtener mensajes enviados:", err);
      res.status(500).json({ error: "Error en el servidor" });
    } else {
      res.json(results);
    }
  });
};

// Enviar mensaje
const enviarMensaje = (req, res) => {
  const { legajo_remitente, destinatarios, asunto, cuerpo } = req.body;

  const query = `INSERT INTO mensajes (legajo_remitente, asunto, cuerpo) VALUES (?, ?, ?)`;

  db.query(query, [legajo_remitente, asunto, cuerpo], async (err, result) => {
    if (err) {
      console.error("Error al enviar mensaje:", err);
      res.status(500).json({ error: "Error en el servidor" });
    } else {
      const mensajeId = result.insertId;

      const destinatarioQueries = destinatarios.map((legajo_destinatario) => {
        return new Promise((resolve, reject) => {
          const insertQuery = `
            INSERT INTO mensaje_destinatarios (mensaje_id, legajo_destinatario)
            VALUES (?, ?)
          `;
          db.query(insertQuery, [mensajeId, legajo_destinatario], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });

      try {
        await Promise.all(destinatarioQueries);
        registrarLog(
          legajo_remitente,
          `Envío de mensaje: asunto "${asunto}" enviado a ${destinatarios.length} destinatario(s)`
        );
        res.json({ success: true, message: "Mensaje enviado" });
      } catch (err) {
        console.error("Error al insertar destinatarios:", err);
        res.status(500).json({ error: "Error en el servidor" });
      }
    }
  });
};

// Marcar como leído
const marcarMensajeLeido = async (req, res) => {
  const { id } = req.params;
  const { legajo_destinatario } = req.body;

  const query = `UPDATE mensaje_destinatarios SET leido = 1 WHERE mensaje_id = ? AND legajo_destinatario = ?`;

  db.query(query, [id, legajo_destinatario], async (err) => {
    if (err) {
      console.error("Error al marcar mensaje como leído:", err);
      res.status(500).json({ error: "Error en el servidor" });
    } else {
      registrarLog(
        legajo_destinatario,
        `Lectura de mensaje: mensaje ID ${id} marcado como leído`
      );
      res.json({ success: true });
    }
  });
};

module.exports = {
  obtenerMensajesRecibidos,
  obtenerMensajesEnviados,
  enviarMensaje,
  marcarMensajeLeido,
};
