const db = require("../DB/db.js");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

// Obtener mensajes recibidos
const obtenerMensajesRecibidos = async (req, res) => {
  const legajo = req.params.legajo;
  const query = `
    SELECT m.id, CONCAT(p.nombre, ' ', p.apellido) AS remitente, m.asunto, m.cuerpo, m.fecha_envio, md.leido
    FROM mensajes m
    JOIN personal p ON m.remitente_id = p.legajo
    JOIN mensaje_destinatarios md ON m.id = md.mensaje_id
    WHERE md.destinatario_id = ?
    ORDER BY m.fecha_envio DESC
  `;
  try {
    const [results] = await db.query(query, [legajo]);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error al obtener mensajes recibidos:", err);
    res.status(500).json({ success: false, error: "Error en el servidor" });
  }
};

// Obtener mensajes enviados
const obtenerMensajesEnviados = async (req, res) => {
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
  try {
    const [results] = await db.query(query, [legajo]);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error al obtener mensajes enviados:", err);
    res.status(500).json({ success: false, error: "Error en el servidor" });
  }
};

// Enviar mensaje
const enviarMensaje = async (req, res) => {
  const { remitente_id, destinatarios, asunto, cuerpo } = req.body;

  const query = `INSERT INTO mensajes (remitente_id, asunto, cuerpo) VALUES (?, ?, ?)`;

  try {
    const [result] = await db.query(query, [remitente_id, asunto, cuerpo]);
    const mensajeId = result.insertId;

    for (const destinatario_id of destinatarios) {
      const insertQuery = `
        INSERT INTO mensaje_destinatarios (mensaje_id, destinatario_id)
        VALUES (?, ?)
      `;
      await db.query(insertQuery, [mensajeId, destinatario_id]);
    }

    registrarLog(
      remitente_id,
      `Envío de mensaje: asunto "${asunto}" enviado a ${destinatarios.length} destinatario(s)`
    );
    res.status(200).json({ success: true, message: "Mensaje enviado" });
  } catch (err) {
    console.error("Error al enviar mensaje:", err);
    res.status(500).json({ success: false, error: "Error en el servidor" });
  }
};

// Marcar como leído
const marcarMensajeLeido = async (req, res) => {
  const { id } = req.params;
  const { destinatario_id } = req.body;

  const query = `UPDATE mensaje_destinatarios SET leido = 1 WHERE mensaje_id = ? AND destinatario_id = ?`;

  try {
    await db.query(query, [id, destinatario_id]);
    registrarLog(
      destinatario_id,
      `Lectura de mensaje: mensaje ID ${id} marcado como leído`
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error al marcar mensaje como leído:", err);
    res.status(500).json({ success: false, error: "Error en el servidor" });
  }
};

module.exports = {
  obtenerMensajesRecibidos,
  obtenerMensajesEnviados,
  enviarMensaje,
  marcarMensajeLeido,
};
