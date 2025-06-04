const db = require('../DB/db.js');

// Personal que más y menos asistió
const obtenerRankingAsistencias = (req, res) => {
  let query = `
    SELECT legajo_personal, CONCAT(nombre, ' ', apellido) AS nombre_completo, COUNT(*) AS cantidad
    FROM movimientos_cuartel
    WHERE estado_id = 1 AND visible = 1
  `;
  if (req.query.solo_personal === 'true') {
    query += ` AND legajo_personal IS NOT NULL`;
  }
  query += `
    GROUP BY legajo_personal, nombre, apellido
    ORDER BY cantidad DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener ranking' });
    res.json(results);
  });
};

// Personal con más y menos horas en el cuartel
const obtenerRankingHoras = (req, res) => {
  let query = `
    SELECT legajo_personal, nombre, apellido, SUM(TIMESTAMPDIFF(MINUTE, ingreso, egreso)) / 60 AS horas_totales
    FROM (
      SELECT 
        m1.legajo_personal, m1.nombre, m1.apellido,
        m1.timestamp AS ingreso,
        (SELECT m2.timestamp FROM movimientos_cuartel m2 
         WHERE m2.estado_id = 2 AND m2.legajo_personal = m1.legajo_personal AND m2.timestamp > m1.timestamp 
         ORDER BY m2.timestamp ASC LIMIT 1) AS egreso
      FROM movimientos_cuartel m1
      WHERE m1.estado_id = 1 AND m1.visible = 1
  `;
  if (req.query.solo_personal === 'true') {
    query += ` AND m1.legajo_personal IS NOT NULL`;
  }
  query += `
    ) AS sesiones
    WHERE egreso IS NOT NULL
    GROUP BY legajo_personal, nombre, apellido
    ORDER BY horas_totales DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener horas' });
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
  if (req.query.solo_personal === 'true') {
    query += ` AND legajo_personal IS NOT NULL`;
  }
  query += `
    GROUP BY dia
    ORDER BY dia
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener por día' });
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
  if (req.query.solo_personal === 'true') {
    query += ` AND legajo_personal IS NOT NULL`;
  }
  query += `
    GROUP BY mes
    ORDER BY mes
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener por mes' });
    res.json(results);
  });
};

// Asistencia por jerarquía
const obtenerAsistenciaPorJerarquia = (req, res) => {
  let query = `
    SELECT p.jerarquia, COUNT(*) AS cantidad
    FROM movimientos_cuartel m
    JOIN personal p ON m.legajo_personal = p.legajo
    WHERE m.estado_id = 1 AND m.visible = 1
  `;
  if (req.query.solo_personal === 'true') {
    query += ` AND m.legajo_personal IS NOT NULL`;
  }
  query += `
    GROUP BY p.jerarquia
    ORDER BY cantidad DESC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener por jerarquía' });
    res.json(results);
  });
};

const obtenerEstadisticasFiltradas = (req, res) => {
  const { tipo_asistencia, fecha_inicio, fecha_fin, jefe_dotacion } = req.query;

  let condiciones = [];
  let valores = [];

  if (tipo_asistencia) {
    condiciones.push("tipo_asistencia = ?");
    valores.push(tipo_asistencia);
  }

  if (fecha_inicio && fecha_fin) {
    condiciones.push("fecha BETWEEN ? AND ?");
    valores.push(fecha_inicio, fecha_fin);
  }

  if (jefe_dotacion) {
    condiciones.push("legajo_jefe_dotacion = ?");
    valores.push(jefe_dotacion);
  }

  let query = `
    SELECT tipo_asistencia, COUNT(*) AS cantidad
    FROM partes
  `;

  if (condiciones.length > 0) {
    query += ` WHERE ${condiciones.join(" AND ")}`;
  }

  query += ` GROUP BY tipo_asistencia`;

  db.query(query, valores, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener estadísticas filtradas' });
    res.json(results);
  });
};

module.exports = {
  obtenerRankingAsistencias,
  obtenerRankingHoras,
  obtenerAsistenciaPorDia,
  obtenerAsistenciaPorMes,
  obtenerAsistenciaPorJerarquia,
  obtenerEstadisticasFiltradas
};