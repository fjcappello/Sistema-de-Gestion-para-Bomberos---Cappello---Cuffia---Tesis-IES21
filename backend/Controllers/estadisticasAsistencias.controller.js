// Ruta para obtener el promedio de asistencia por persona (filtrable)
const obtenerPromedioAsistencia = (req, res) => {
  const { desde, hasta } = req.query;
  let queryParams = [];
  let where = "WHERE m.estado_id = 1 AND m.visible = 1 AND m.id_personal IS NOT NULL";

  if (desde) {
    where += " AND DATE(m.timestamp) >= ?";
    queryParams.push(desde);
  }

  if (hasta) {
    where += " AND DATE(m.timestamp) <= ?";
    queryParams.push(hasta);
  }

  const query = `
    SELECT AVG(cantidad) AS promedio_asistencias
    FROM (
      SELECT COUNT(*) AS cantidad
      FROM movimientos_cuartel m
      ${where}
      GROUP BY m.id_personal
    ) AS subquery;
  `;

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error al obtener promedio de asistencia:", err);
      return res.status(500).json({ error: "Error al obtener promedio de asistencia", detalle: err.message });
    }
    res.json(results[0]);
  });
};

// Ruta para obtener tasa de asistencia diaria sobre el total del personal activo
const obtenerTasaAsistenciaDiaria = (req, res) => {
  const { desde, hasta } = req.query;
  let queryParams = [];

  // El WHERE se construye directamente dentro del subquery, por lo que ajustamos los params también
  const query = `
    SELECT dia, COUNT(DISTINCT id_personal) AS presentes, (SELECT COUNT(*) FROM personal WHERE activo = 1) AS total_personal,
           ROUND((COUNT(DISTINCT id_personal) / (SELECT COUNT(*) FROM personal WHERE activo = 1)) * 100, 2) AS tasa_asistencia
    FROM (
      SELECT DATE(timestamp) AS dia, id_personal
      FROM movimientos_cuartel
      WHERE estado_id = 1 AND visible = 1 AND id_personal IS NOT NULL
      ${desde ? " AND DATE(timestamp) >= ?" : ""}
      ${hasta ? " AND DATE(timestamp) <= ?" : ""}
    ) AS sub
    GROUP BY dia
    ORDER BY dia;
  `;
  if (desde) queryParams.push(desde);
  if (hasta) queryParams.push(hasta);

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error al obtener tasa de asistencia diaria:", err);
      return res.status(500).json({ error: "Error al obtener tasa de asistencia diaria", detalle: err.message });
    }
    res.json(results);
  });
};
const db = require("../DB/db.js");

// Ruta para obtener el ranking de asistencias del personal, permitiendo filtrar por fecha, legajo, nombre y orden
const obtenerRankingAsistencias = (req, res) => {
  const { desde, hasta, legajo, nombre, orden = "desc", limite } = req.query;
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

  if (orden && orden.toLowerCase() === "asc") {
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
      console.error("Error al obtener ranking de asistencias:", err);
      return res.status(500).json({
        error: "Error al obtener ranking de asistencias",
        detalle: err.message,
      });
    }
    res.json(results);
  });
};

// Ruta para obtener el ranking de horas que permaneció el personal en la institucion, permitiendo filtrar por fecha, legajo, nombre y orden
const obtenerRankingHoras = (req, res) => {
  const { desde, hasta, legajo, nombre, orden = "desc", limite } = req.query;
  let queryParamsMain = [];
  let queryParamsSub = [];

  let conditions = [
    "m1.estado_id = 1",
    "m1.visible = 1",
    "m1.id_personal IS NOT NULL"
  ];

  let subQueryConditions = [
    "sq_m2.id_personal = m1.id_personal",
    "sq_m2.timestamp > m1.timestamp",
    "sq_m2.estado_id = 2",
    "sq_m2.visible = 1"
  ];

  if (desde) {
    conditions.push("DATE(m1.timestamp) >= ?");
    queryParamsMain.push(desde);
  }
  if (hasta) {
    conditions.push("DATE(m1.timestamp) <= ?");
    queryParamsMain.push(hasta);
     }
  if (legajo) {
    conditions.push("m1.id_personal = ?");
    queryParamsMain.push(legajo);
  }
  if (nombre) {
    conditions.push("CONCAT(p.nombre, ' ', p.apellido) LIKE ?");
    queryParamsMain.push(`%${nombre}%`);
  }

  const egresoSubQuery = `(
    SELECT MIN(sq_m2.timestamp)
    FROM movimientos_cuartel sq_m2
    WHERE ${subQueryConditions.join(" AND ")}
  )`;

  let query = `
    SELECT
      p.legajo,
      CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo,
      SUM(
        TIMESTAMPDIFF(MINUTE, m1.timestamp, IFNULL(${egresoSubQuery}, m1.timestamp))
      ) / 60 AS horas_totales
    FROM movimientos_cuartel m1
    JOIN personal p ON m1.id_personal = p.legajo
    WHERE ${conditions.join(" AND ")}
    GROUP BY p.legajo, p.nombre, p.apellido
  `;

  const validOrder = ["asc", "desc"].includes(orden.toLowerCase())
    ? orden.toLowerCase()
    : "desc";
  query += ` ORDER BY horas_totales ${validOrder}`;

  const finalParams = [...queryParamsMain, ...queryParamsSub];

  if (limite && !isNaN(parseInt(limite))) {
    query += ` LIMIT ?`;
    finalParams.push(parseInt(limite));
  }

  db.query(query, finalParams, (err, results) => {
    if (err) {
      console.error("Error en obtenerRankingHoras:", err);
      return res.status(500).json({
        error: "Error al obtener ranking de horas",
        detalle: err.message,
      });
    }
    const processedResults = results.map((r) => ({
      ...r,
      horas_totales: parseFloat(r.horas_totales) || 0,
    }));
    res.json(processedResults);
  });
};

// Ruta para obtener la asistencia del personal por día, permitiendo filtrar por fecha, legajo y nombre
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
      console.error("Error en obtenerAsistenciaPorDia:", err);
      return res.status(500).json({
        error: "Error al obtener asistencia por día",
        detalle: err.message,
      });
    }
    res.json(results);
  });
};

// Ruta para obtener la asistencia del personal por mes, permitiendo filtrar por fecha, legajo y nombre
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
      console.error("Error en obtenerAsistenciaPorMes:", err);
      return res.status(500).json({
        error: "Error al obtener asistencia por mes",
        detalle: err.message,
      });
    }
    res.json(results);
  });
};

// Ruta para obtener la asistencia del personal por jerarquía, permitiendo filtrar por fecha, legajo y nombre
const obtenerAsistenciaPorJerarquia = (req, res) => {
  const { desde, hasta, legajo, nombre } = req.query;
  let queryParams = [];
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
    query += ` AND m.id_personal = ?`;
    queryParams.push(legajo);
  }
  if (nombre) {
    query += ` AND CONCAT(p.nombre, ' ', p.apellido) LIKE ?`;
    queryParams.push(`%${nombre}%`);
  }

  query += ` GROUP BY j.id, j.jerarquia ORDER BY cantidad DESC`;

  db.query(query, queryParams, (err, results) => {
    if (err) {
      console.error("Error en obtenerAsistenciaPorJerarquia:", err);
      return res.status(500).json({
        error: "Error al obtener asistencia por jerarquía",
        detalle: err.message,
      });
    }
    res.json(results);
  });
};

module.exports = {
  obtenerPromedioAsistencia,
  obtenerTasaAsistenciaDiaria,
  obtenerRankingAsistencias,
  obtenerRankingHoras,
  obtenerAsistenciaPorDia,
  obtenerAsistenciaPorMes,
  obtenerAsistenciaPorJerarquia,
};
