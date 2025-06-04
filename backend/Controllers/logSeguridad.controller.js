const db = require("../DB/db.js");

// Obtener registros de bitácora con filtros opcionales
const obtenerLog = (req, res) => {
  const { usuario_id, accion, desde, hasta } = req.query;

  let query = `
    SELECT b.id, b.legajo_usuario AS usuario_id, CONCAT(p.nombre, ' ', p.apellido) AS usuario, b.accion, DATE_FORMAT(b.fecha, '%d/%m/%Y %H:%i:%s') AS fecha
    FROM registro_seguridad b
    LEFT JOIN personal p ON b.legajo_usuario = p.legajo
    WHERE 1 = 1
  `;
  const params = [];

  if (usuario_id) {
    query += " AND b.legajo_usuario = ?";
    params.push(usuario_id);
  }

  if (accion) {
    query += " AND b.accion LIKE ?";
    params.push(`%${accion}%`);
  }

  if (desde) {
    query += " AND b.fecha >= ?";
    params.push(desde);
  }

  if (hasta) {
    query += " AND b.fecha <= ?";
    params.push(hasta);
  }

  query += " ORDER BY b.fecha DESC";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error al obtener la bitácora:", err);
      res.status(500).json({ error: "Error al consultar la bitácora" });
    } else {
      res.json(results);
    }
  });
};

module.exports = {
  obtenerLog,
};
