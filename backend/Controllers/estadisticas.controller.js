const db = require("../DB/db.js");

exports.obtenerEstadisticas = (req, res) => {
  const dias = parseInt(req.query.dias) || 30;

  const query = `
    SELECT tipo_asistencia, COUNT(*) AS cantidad
    FROM partes
    WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY tipo_asistencia
  `;

  db.query(query, [dias], (err, results) => {
    if (err) {
      console.error("Error al obtener estadísticas:", err);
      return res.status(500).json({ error: "Error al obtener estadísticas" });
    }

    res.json(results);
  });
};

exports.obtenerEstadisticasFiltradas = (req, res) => {
  const { fecha_desde, fecha_hasta, tipo_asistencia, jefe_dotacion } = req.query;

  let condiciones = [];
  let valores = [];

  if (fecha_desde) {
    condiciones.push("fecha >= ?");
    valores.push(fecha_desde);
  }

  if (fecha_hasta) {
    condiciones.push("fecha <= ?");
    valores.push(fecha_hasta);
  }

  if (tipo_asistencia) {
    condiciones.push("tipo_asistencia = ?");
    valores.push(tipo_asistencia);
  }

  if (jefe_dotacion) {
    condiciones.push("jefe_dotacion = ?");
    valores.push(jefe_dotacion);
  }

  const whereClause = condiciones.length > 0 ? "WHERE " + condiciones.join(" AND ") : "";

  const query = `
    SELECT tipo_asistencia, COUNT(*) AS cantidad
    FROM partes
    ${whereClause}
    GROUP BY tipo_asistencia
  `;

  db.query(query, valores, (err, results) => {
    if (err) {
      console.error("Error al obtener estadísticas filtradas:", err);
      return res.status(500).json({ error: "Error al obtener estadísticas filtradas" });
    }

    res.json(results);
  });
};

exports.obtenerPorTipoYHora = (req, res) => {
  const query = `
    SELECT tipo_asistencia, HOUR(fecha) AS hora, COUNT(*) AS cantidad
    FROM partes
    GROUP BY tipo_asistencia, HOUR(fecha)
    ORDER BY tipo_asistencia, hora
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener estadísticas por hora:", err);
      return res.status(500).json({ error: "Error al obtener estadísticas por hora" });
    }

    res.json(results);
  });
};

exports.obtenerPorBombero = (req, res) => {
  const query = `
    SELECT CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo, COUNT(*) AS cantidad
    FROM partes AS e
    JOIN personal AS p ON e.jefe_dotacion = p.legajo
    GROUP BY e.jefe_dotacion
    ORDER BY cantidad DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener estadísticas por bombero:", err);
      return res.status(500).json({ error: "Error al obtener estadísticas por bombero" });
    }

    res.json(results);
  });
};
