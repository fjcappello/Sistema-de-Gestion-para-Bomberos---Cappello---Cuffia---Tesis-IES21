const db = require("../DB/db.js");

// Personal que más y menos asistió
const obtenerRankingAsistencias = (req, res) => {
  let query = `
    SELECT id_personal, CONCAT(nombre, ' ', apellido) AS nombre_completo, COUNT(*) AS cantidad
    FROM movimientos_cuartel
    WHERE estado_id = 1 AND visible = 1
  `;
  if (req.query.solo_personal === "true") {
    query += ` AND id_personal IS NOT NULL`;
  }
  query += `
    GROUP BY id_personal, nombre, apellido
    ORDER BY cantidad DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener ranking" });
    res.json(results);
  });
};

// Personal con más y menos horas en el cuartel
const obtenerRankingHoras = (req, res) => {
  let query = `
    SELECT id_personal, nombre, apellido, SUM(TIMESTAMPDIFF(MINUTE, ingreso, egreso)) / 60 AS horas_totales
    FROM (
      SELECT 
        m1.id_personal, m1.nombre, m1.apellido,
        m1.timestamp AS ingreso,
        (SELECT m2.timestamp FROM movimientos_cuartel m2 
         WHERE m2.estado_id = 2 AND m2.id_personal = m1.id_personal AND m2.timestamp > m1.timestamp 
         ORDER BY m2.timestamp ASC LIMIT 1) AS egreso
      FROM movimientos_cuartel m1
      WHERE m1.estado_id = 1 AND m1.visible = 1
  `;
  if (req.query.solo_personal === "true") {
    query += ` AND m1.id_personal IS NOT NULL`;
  }
  query += `
    ) AS sesiones
    WHERE egreso IS NOT NULL
    GROUP BY id_personal, nombre, apellido
    ORDER BY horas_totales DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener horas" });
    res.json(results);
  });
};

// Asistencia por día
const obtenerAsistenciaPorDia = (req, res) => {
  let query = `
    SELECT DATE(timestamp) AS dia, COUNT(*) AS cantidad
    FROM movimientos_cuartel
    WHERE estado_id = 1 AND visible = 1
  `;
  if (req.query.solo_personal === "true") {
    query += ` AND id_personal IS NOT NULL`;
  }
  query += `
    GROUP BY dia
    ORDER BY dia
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener por día" });
    res.json(results);
  });
};

// Asistencia por mes
const obtenerAsistenciaPorMes = (req, res) => {
  let query = `
    SELECT DATE_FORMAT(timestamp, '%Y-%m') AS mes, COUNT(*) AS cantidad
    FROM movimientos_cuartel
    WHERE estado_id = 1 AND visible = 1
  `;
  if (req.query.solo_personal === "true") {
    query += ` AND id_personal IS NOT NULL`;
  }
  query += `
    GROUP BY mes
    ORDER BY mes
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener por mes" });
    res.json(results);
  });
};

// Asistencia por jerarquía
const obtenerAsistenciaPorJerarquia = (req, res) => {
  let query = `
    SELECT p.jerarquia, COUNT(*) AS cantidad
    FROM movimientos_cuartel m
    JOIN personal p ON m.id_personal = p.legajo
    WHERE m.estado_id = 1 AND m.visible = 1
  `;
  if (req.query.solo_personal === "true") {
    query += ` AND m.id_personal IS NOT NULL`;
  }
  query += `
    GROUP BY p.jerarquia
    ORDER BY cantidad DESC
  `;
  db.query(query, (err, results) => {
    if (err)
      return res.status(500).json({ error: "Error al obtener por jerarquía" });
    res.json(results);
  });
};

module.exports = {
  obtenerRankingAsistencias,
  obtenerRankingHoras,
  obtenerAsistenciaPorDia,
  obtenerAsistenciaPorMes,
  obtenerAsistenciaPorJerarquia,
};
