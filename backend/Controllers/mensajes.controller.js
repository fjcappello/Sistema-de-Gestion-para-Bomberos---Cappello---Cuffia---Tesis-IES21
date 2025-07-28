const db = require("../db");
const enviarCorreo = require("../utils/mailer");
const registrarLog = require("../utils/registrarLog");

// Obtener mensajes recibidos
const obtenerMensajesRecibidos = async (req, res) => {
  const { destinatario_id } = req.params;

  const query = `
    SELECT m.*, p.nombre, p.apellido, md.leido
    FROM mensajes m
    JOIN mensaje_destinatarios md ON m.id = md.mensaje_id
    JOIN personal p ON m.remitente_id = p.id
    WHERE md.destinatario_id = ?
    ORDER BY m.fecha DESC
  `;

  db.query(query, [destinatario_id], (err, results) => {
    if (err) {
      console.error("Error al obtener mensajes recibidos:", err);
      res.status(500).json({ error: "Error en el servidor" });
    } else {
      res.json(results);
    }
  });
};

// Obtener mensajes enviados
const obtenerMensajesEnviados = async (req, res) => {
  const { remitente_id } = req.params;

  const query = `
    SELECT m.*, GROUP_CONCAT(CONCAT(p.nombre, ' ', p.apellido) SEPARATOR ', ') AS destinatarios
    FROM mensajes m
    JOIN mensaje_destinatarios md ON m.id = md.mensaje_id
    JOIN personal p ON md.destinatario_id = p.id
    WHERE m.remitente_id = ?
    GROUP BY m.id
    ORDER BY m.fecha DESC
  `;

  db.query(query, [remitente_id], (err, results) => {
    if (err) {
      console.error("Error al obtener mensajes enviados:", err);
      res.status(500).json({ error: "Error en el servidor" });
    } else {
      res.json(results);
    }
  });
};

// Enviar mensaje
const enviarMensaje = async (req, res) => {
  const { remitente_id, asunto, cuerpo, destinatarios } = req.body;

  const queryMensaje = "INSERT INTO mensajes (remitente_id, asunto, cuerpo, fecha) VALUES (?, ?, ?, NOW())";

  db.query(queryMensaje, [remitente_id, asunto, cuerpo], async (err, result) => {
    if (err) {
      console.error("Error al insertar mensaje:", err);
      res.status(500).json({ error: "Error en el servidor" });
    } else {
      const mensajeId = result.insertId;

      try {
        const insertDestinatarios = destinatarios.map(destinatario_id => {
          return new Promise((resolve, reject) => {
            const queryDest = "INSERT INTO mensaje_destinatarios (mensaje_id, destinatario_id) VALUES (?, ?)";
            db.query(queryDest, [mensajeId, destinatario_id], (err) => {
              if (err) reject(err);
              else resolve();
            });
          });
        });

        await Promise.all(insertDestinatarios);

        const envioCorreos = destinatarios.map(async (destinatario_id) => {
          try {
            const [result] = await db
              .promise()
              .query("SELECT email FROM personal WHERE id = ?", [destinatario_id]);

            const email = result[0]?.email;
            if (email && email.trim() !== "") {
              const cuerpoCorreo = `
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

        registrarLog(
          remitente_id,
          `Envío de mensaje: asunto "${asunto}" enviado a ${destinatarios.length} destinatario(s)`
        );
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
    } else {
      res.status(200).json({ success: true });
    }
  });
};

module.exports = {
  obtenerMensajesRecibidos,
  obtenerMensajesEnviados,
  enviarMensaje,
  marcarMensajeLeido,
};