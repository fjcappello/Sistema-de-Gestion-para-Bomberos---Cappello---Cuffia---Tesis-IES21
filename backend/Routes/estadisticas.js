const express = require("express");
const router = express.Router();
const db = require("../DB/db");

router.get("/estadisticas", async (req, res) => {
  const dias = parseInt(req.query.dias) || 30;

  const query = `
    SELECT tipo_asistencia, COUNT(*) AS cantidad
    FROM partes
    WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    GROUP BY tipo_asistencia
  `;

  try {
    const [results] = await db.query(query, [dias]);
    res.json(results);
  } catch (err) {
    console.error("Error al obtener estadísticas:", err);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

router.get("/estadisticas_filtros", async (req, res) => {
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

  const whereClause =
    condiciones.length > 0 ? "WHERE " + condiciones.join(" AND ") : "";

  const query = `
    SELECT tipo_asistencia, COUNT(*) AS cantidad
    FROM partes
    ${whereClause}
    GROUP BY tipo_asistencia
  `;

  try {
    const [results] = await db.query(query, valores);
    res.json(results);
  } catch (err) {
    console.error("Error al obtener estadísticas filtradas:", err);
    res.status(500).json({ error: "Error al obtener estadísticas filtradas" });
  }
});

module.exports = router;
