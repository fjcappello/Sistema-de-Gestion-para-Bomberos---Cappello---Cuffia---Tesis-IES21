const express = require("express");
const router = express.Router();
const db = require("../db");

// GET para obtener el conteo de asistencia en los ultimos 'n' días (por defecto usamos 30 días)
router.get("/estadisticas", (req, res) => {
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
});

// GET que permite aplicar filtros para las estadisicas, fecha desde hasta, tipo de asistencia y jefe de dotación
router.get("/estadisticas_filtros", (req, res) => {
  const { fecha_desde, fecha_hasta, tipo_asistencia, jefe_dotacion } =
    req.query;

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

  const whereClause =
    condiciones.length > 0 ? "WHERE " + condiciones.join(" AND ") : "";

  const query = `
    SELECT tipo_asistencia, COUNT(*) AS cantidad
    FROM partes
    ${whereClause}
    GROUP BY tipo_asistencia
  `;

  db.query(query, valores, (err, results) => {
    if (err) {
      console.error("Error al obtener estadísticas filtradas:", err);
      return res
        .status(500)
        .json({ error: "Error al obtener estadísticas filtradas" });
    }

    res.json(results);
  });
});

module.exports = router;
