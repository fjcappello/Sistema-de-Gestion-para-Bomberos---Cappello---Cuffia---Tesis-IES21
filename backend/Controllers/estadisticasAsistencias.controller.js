const db = require('../DB/db.js');

// Personal que más y menos asistió
const obtenerRankingAsistencias = async (req, res) => {
  let query = `
    SELECT id_personal, CONCAT(nombre, ' ', apellido) AS nombre_completo, COUNT(*) AS cantidad
    FROM movimientos_cuartel
    WHERE estado_id = 1 AND visible = 1
  `;
  if (req.query.solo_personal === 'true') {
    query += ` AND id_personal IS NOT NULL`;
  }
  query += `
    GROUP BY id_personal, nombre, apellido
    ORDER BY cantidad DESC
  `;
  try {
    const [results] = await db.query(query);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al obtener ranking' });
  }
};

// Personal con más y menos horas en el cuartel
const obtenerRankingHoras = async (req, res) => {
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
  if (req.query.solo_personal === 'true') {
    query += ` AND m1.id_personal IS NOT NULL`;
  }
  query += `
    ) AS sesiones
    WHERE egreso IS NOT NULL
    GROUP BY id_personal, nombre, apellido
    ORDER BY horas_totales DESC
  `;
  try {
    const [results] = await db.query(query);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al obtener horas' });
  }
};

// Asistencia por día
const obtenerAsistenciaPorDia = async (req, res) => {
  let query = `
    SELECT DATE(timestamp) AS dia, COUNT(*) AS cantidad
    FROM movimientos_cuartel
    WHERE estado_id = 1 AND visible = 1
  `;
  if (req.query.solo_personal === 'true') {
    query += ` AND id_personal IS NOT NULL`;
  }
  query += `
    GROUP BY dia
    ORDER BY dia
  `;
  try {
    const [results] = await db.query(query);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al obtener por día' });
  }
};

// Asistencia por mes
const obtenerAsistenciaPorMes = async (req, res) => {
  let query = `
    SELECT DATE_FORMAT(timestamp, '%Y-%m') AS mes, COUNT(*) AS cantidad
    FROM movimientos_cuartel
    WHERE estado_id = 1 AND visible = 1
  `;
  if (req.query.solo_personal === 'true') {
    query += ` AND id_personal IS NOT NULL`;
  }
  query += `
    GROUP BY mes
    ORDER BY mes
  `;
  try {
    const [results] = await db.query(query);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al obtener por mes' });
  }
};

// Asistencia por jerarquía
const obtenerAsistenciaPorJerarquia = async (req, res) => {
  let query = `
    SELECT p.jerarquia, COUNT(*) AS cantidad
    FROM movimientos_cuartel m
    JOIN personal p ON m.id_personal = p.legajo
    WHERE m.estado_id = 1 AND m.visible = 1
  `;
  if (req.query.solo_personal === 'true') {
    query += ` AND m.id_personal IS NOT NULL`;
  }
  query += `
    GROUP BY p.jerarquia
    ORDER BY cantidad DESC
  `;
  try {
    const [results] = await db.query(query);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al obtener por jerarquía' });
  }
};

module.exports = {
  obtenerRankingAsistencias,
  obtenerRankingHoras,
  obtenerAsistenciaPorDia,
  obtenerAsistenciaPorMes,
  obtenerAsistenciaPorJerarquia,
};