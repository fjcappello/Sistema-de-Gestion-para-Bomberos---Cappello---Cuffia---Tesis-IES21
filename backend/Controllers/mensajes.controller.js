const { enviarCorreo } = require("../Middlewares/email");
const db = require("../DB/db.js");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

// Obtener mensajes recibidos
const obtenerMensajesRecibidos = (req, res) => {
  const legajo = req.params.legajo;
  const query = `
    SELECT 
      m.id, 
      CONCAT(p.nombre, ' ', p.apellido) AS remitente, 
      m.asunto, 
      m.cuerpo, 
      m.fecha_envio, 
      md.leido
    FROM mensajes m
    JOIN personal p ON m.remitente_id = p.legajo
    JOIN mensaje_destinatarios md ON m.id = md.mensaje_id
    WHERE md.destinatario_id = ?
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
    SELECT 
      m.id, 
      GROUP_CONCAT(CONCAT(p.nombre, ' ', p.apellido) SEPARATOR ', ') AS destinatarios,
      m.asunto, 
      m.cuerpo, 
      m.fecha_envio
    FROM mensajes m
    JOIN mensaje_destinatarios md ON m.id = md.mensaje_id
    JOIN personal p ON md.destinatario_id = p.legajo
    WHERE m.remitente_id = ?
    GROUP BY m.id, m.asunto, m.cuerpo, m.fecha_envio
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
  const { remitente_id, destinatarios, asunto, cuerpo } = req.body;

  const query = `INSERT INTO mensajes (remitente_id, asunto, cuerpo) VALUES (?, ?, ?)`;

  db.query(query, [remitente_id, asunto, cuerpo], async (err, result) => {
    if (err) {
      console.error("Error al enviar mensaje:", err);
      res.status(500).json({ error: "Error en el servidor" });
    } else {
      const mensajeId = result.insertId;

      const destinatarioQueries = destinatarios.map((destinatario_id) => {
        return new Promise((resolve, reject) => {
          const insertQuery = `
            INSERT INTO mensaje_destinatarios (mensaje_id, destinatario_id)
            VALUES (?, ?)
          `;
          db.query(insertQuery, [mensajeId, destinatario_id], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });

      try {
        await Promise.all(destinatarioQueries);

        const envioCorreos = destinatarios.map(async (destinatario_id) => {
          try {
            const [results] = await db
              .promise()
              .query(
                "SELECT email, nombre, apellido FROM personal WHERE legajo = ?",
                [destinatario_id]
              );
            if (results.length > 0 && results[0].email) {
              const { email, nombre, apellido } = results[0];
              const cuerpoCorreo = `
                Hola ${nombre} ${apellido},

                Has recibido un nuevo mensaje en el sistema SIGB.

                Asunto: ${asunto}

                Mensaje:
                ${cuerpo}

                Por favor, ingresá al sistema para verlo y responder.

                Este mensaje fue generado automáticamente por el sistema SIGB, por favor no responderlo.`;
              await enviarCorreo(
                email,
                `Nuevo mensaje: ${asunto}`,
                cuerpoCorreo
              );
            }
          } catch (error) {
            console.error(
              `Error al enviar correo a destinatario ${destinatario_id}:`,
              error
            );
          }
        });

        await Promise.all(envioCorreos);

        res.json({ success: true, message: "Mensaje enviado" });
      } catch (err) {
        console.error("Error al insertar destinatarios o enviar correos:", err);
        res.status(500).json({ error: "Error en el servidor" });
      }
    }
  });
};

// Marcar como leído
const marcarMensajeLeido = async (req, res) => {
  const { id } = req.params;
  const { destinatario_id } = req.body;

  const query = `UPDATE mensaje_destinatarios SET leido = 1 WHERE mensaje_id = ? AND destinatario_id = ?`;

  db.query(query, [id, destinatario_id], async (err) => {
    if (err) {
      console.error("Error al marcar mensaje como leído:", err);
      res.status(500).json({ error: "Error en el servidor" });
    } 
      res.status(200).json({ success: true });
  });
};

module.exports = {
  obtenerMensajesRecibidos,
  obtenerMensajesEnviados,
  enviarMensaje,
  marcarMensajeLeido,
};