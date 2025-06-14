const db = require('../DB/db.js');

// Personal que más y menos asistió
const obtenerRankingAsistencias = (req, res) => {
  const { desde, hasta, legajo, nombre, orden = 'desc', limite } = req.query;
  let queryParams = [];
  let query = `
    SELECT p.legajo, CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo, COUNT(*) AS cantidad
    FROM movimientos_cuartel m
    JOIN personal p ON m.id_personal = p.legajo
    WHERE m.estado_id = 1 AND m.visible = 1 AND m.id_personal IS NOT NULL
  `;

  if (desde) {
    query += ` AND DATE(m.timestamp) >= ?`;
    queryParams.push(desde);
  }
  if (hasta) {
    query += ` AND DATE(m.timestamp) <= ?`;
    queryParams.push(hasta);
  }
  if (legajo) {
    query += ` AND m.id_personal = ?`;
    queryParams.push(legajo);
  }
  if (nombre) {
    query += ` AND CONCAT(p.nombre, ' ', p.apellido) LIKE ?`;
    queryParams.push(`%${nombre}%`);
  }

  query += ` GROUP BY p.legajo, p.nombre, p.apellido`;

  if (orden && orden.toLowerCase() === 'asc') {
    query += ` ORDER BY cantidad ASC`;
  } else {
    query += ` ORDER BY cantidad DESC`;
  }

  if (limite && !isNaN(parseInt(limite))) {
    query += ` LIMIT ?`;
    queryParams.push(parseInt(limite));
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error al obtener ranking de asistencias:', err);
      return res.status(500).json({ error: 'Error al obtener ranking de asistencias', detalle: err.message });
    }
    res.json(results);
  });
};

// Personal con más y menos horas en el cuartel
const obtenerRankingHoras = (req, res) => {
  const { desde, hasta, legajo, nombre, orden = 'desc', limite } = req.query;
  let queryParams = [];
  let conditions = ["m1.estado_id = 1", "m1.visible = 1", "m1.id_personal IS NOT NULL"];

  // Subquery conditions for finding the corresponding exit (sq_m2)
  // Ensure sq_m2 is visible, otherwise we might pick up a non-visible exit record
  let subQueryConditions = ["sq_m2.id_personal = m1.id_personal", "sq_m2.timestamp > m1.timestamp", "sq_m2.estado_id = 2", "sq_m2.visible = 1"];

  if (desde) {
      conditions.push("DATE(m1.timestamp) >= ?");
      queryParams.push(desde);
  }
  if (hasta) {
      // Entry must be before or on 'hasta'
      conditions.push("DATE(m1.timestamp) <= ?");
      queryParams.push(hasta);
      // Exit (sq_m2) must also be before or on 'hasta' (or up to end of 'hasta' day for accurate duration within the period)
      // This ensures that if an entry is on 'hasta', its exit on the same day is considered.
      // And if an entry is before 'hasta', its exit after 'hasta' is effectively capped at 'hasta' for duration calculation (implicitly by not finding a valid egreso for SUM)
      // However, the explicit condition below makes sure the selected egreso is within the period.
      subQueryConditions.push("DATE(sq_m2.timestamp) <= ?");
      queryParams.push(hasta); // Parameter for subQueryConditions
  }
  if (legajo) {
      conditions.push("m1.id_personal = ?"); // Refers to p.legajo via JOIN
      queryParams.push(legajo);
  }
  if (nombre) {
      conditions.push("CONCAT(p.nombre, ' ', p.apellido) LIKE ?");
      queryParams.push(`%${nombre}%`);
  }

  // Construct the part of the subquery that selects the MIN(sq_m2.timestamp)
  const egresoSubQuery = `(
      SELECT MIN(sq_m2.timestamp)
      FROM movimientos_cuartel sq_m2
      WHERE ${subQueryConditions.join(' AND ')}
  )`;

  let query = `
      SELECT
          p.legajo,
          CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo,
          SUM(
              TIMESTAMPDIFF(MINUTE, m1.timestamp, ${egresoSubQuery})
          ) / 60 AS horas_totales
      FROM movimientos_cuartel m1
      JOIN personal p ON m1.id_personal = p.legajo
      WHERE ${conditions.join(' AND ')}
      GROUP BY p.legajo, p.nombre, p.apellido
      HAVING horas_totales IS NOT NULL
  `; // Added space before HAVING

  // Validate orden parameter
  const validOrder = ['asc', 'desc'].includes(orden.toLowerCase()) ? orden.toLowerCase() : 'desc';
  query += ` ORDER BY horas_totales ${validOrder}`;

  if (limite && !isNaN(parseInt(limite))) {
      query += ` LIMIT ?`;
      queryParams.push(parseInt(limite));
  }

  // Execute the query
  db.query(query, queryParams, (err, results) => {
      if (err) {
        console.error('Error en obtenerRankingHoras:', err);
        return res.status(500).json({ error: 'Error al obtener ranking de horas', detalle: err.message });
      }
      // Ensure horas_totales is a number
      const processedResults = results.map(r => ({...r, horas_totales: parseFloat(r.horas_totales) || 0 }));
      res.json(processedResults);
  });
};

// Asistencia por día
const obtenerAsistenciaPorDia = (req, res) => {
  const { desde, hasta, legajo, nombre } = req.query;
  let queryParams = [];
  let query = `
    SELECT DATE(m.timestamp) AS dia, COUNT(*) AS cantidad
    FROM movimientos_cuartel m
    JOIN personal p ON m.id_personal = p.legajo
    WHERE m.estado_id = 1 AND m.visible = 1 AND m.id_personal IS NOT NULL
  `;

  if (desde) {
    query += ` AND DATE(m.timestamp) >= ?`;
    queryParams.push(desde);
  }
  if (hasta) {
    query += ` AND DATE(m.timestamp) <= ?`;
    queryParams.push(hasta);
  }
  if (legajo) {
    query += ` AND m.id_personal = ?`;
    queryParams.push(legajo);
  }
  if (nombre) {
    query += ` AND CONCAT(p.nombre, ' ', p.apellido) LIKE ?`;
    queryParams.push(`%${nombre}%`);
  }

  query += ` GROUP BY dia ORDER BY dia ASC`;

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error en obtenerAsistenciaPorDia:', err);
      return res.status(500).json({ error: 'Error al obtener asistencia por día', detalle: err.message });
    }
    res.json(results);
  });
};

// Asistencia por mes
const obtenerAsistenciaPorMes = (req, res) => {
  const { desde, hasta, legajo, nombre } = req.query;
  let queryParams = [];
  let query = `
    SELECT DATE_FORMAT(m.timestamp, '%Y-%m') AS mes, COUNT(*) AS cantidad
    FROM movimientos_cuartel m
    JOIN personal p ON m.id_personal = p.legajo
    WHERE m.estado_id = 1 AND m.visible = 1 AND m.id_personal IS NOT NULL
  `;

  if (desde) {
    query += ` AND DATE(m.timestamp) >= ?`;
    queryParams.push(desde);
  }
  if (hasta) {
    query += ` AND DATE(m.timestamp) <= ?`;
    queryParams.push(hasta);
  }
  if (legajo) {
    query += ` AND m.id_personal = ?`;
    queryParams.push(legajo);
  }
  if (nombre) {
    query += ` AND CONCAT(p.nombre, ' ', p.apellido) LIKE ?`;
    queryParams.push(`%${nombre}%`);
  }

  query += ` GROUP BY mes ORDER BY mes ASC`;

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error en obtenerAsistenciaPorMes:', err);
      return res.status(500).json({ error: 'Error al obtener asistencia por mes', detalle: err.message });
    }
    res.json(results);
  });
};

// Asistencia por jerarquía
const obtenerAsistenciaPorJerarquia = (req, res) => {
  const { desde, hasta, legajo, nombre } = req.query;
  let queryParams = [];
  // Assuming p.jerarquia stores the name or p.jerarquia_id links to a jerarquias table
  // Based on original query: SELECT p.jerarquia, ... GROUP BY p.jerarquia
  // New requirement: JOIN jerarquias j ON p.jerarquia_id = j.id. Select j.jerarquia AS jerarquia_nombre
  // This implies 'personal' table has 'jerarquia_id' and 'jerarquias' table has 'id' and 'jerarquia' (name)
  let query = `
    SELECT j.jerarquia AS jerarquia_nombre, COUNT(*) AS cantidad
    FROM movimientos_cuartel m
    JOIN personal p ON m.id_personal = p.legajo
    JOIN jerarquias j ON p.jerarquia_id = j.id
    WHERE m.estado_id = 1 AND m.visible = 1 AND m.id_personal IS NOT NULL
  `;

  if (desde) {
    query += ` AND DATE(m.timestamp) >= ?`;
    queryParams.push(desde);
  }
  if (hasta) {
    query += ` AND DATE(m.timestamp) <= ?`;
    queryParams.push(hasta);
  }
  if (legajo) {
    query += ` AND m.id_personal = ?`; // This refers to p.legajo via the JOIN m.id_personal = p.legajo
    queryParams.push(legajo);
  }
  if (nombre) {
    query += ` AND CONCAT(p.nombre, ' ', p.apellido) LIKE ?`;
    queryParams.push(`%${nombre}%`);
  }

  // Group by j.id (primary key of jerarquias) and j.jerarquia (name for select)
  query += ` GROUP BY j.id, j.jerarquia ORDER BY cantidad DESC`;

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error('Error en obtenerAsistenciaPorJerarquia:', err);
      return res.status(500).json({ error: 'Error al obtener asistencia por jerarquía', detalle: err.message });
    }
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