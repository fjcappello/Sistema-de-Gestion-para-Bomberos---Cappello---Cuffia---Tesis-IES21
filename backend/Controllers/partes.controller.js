const db = require('../DB/db.js');
const { registrarBitacora } = require('../middlewares/bitacoraLogger');

// Obtener todos los partes con filtros
const obtenerPartes = (req, res) => {
  const { jefeDotacion, tipoAsistencia, startDate, endDate } = req.query;

  let query = `
    SELECT 
      p.id AS parte_id,
      p.numero_parte,
      p.nombre_denunciante,
      p.apellido_denunciante,
      p.documento_denunciante,
      p.direccion,
      p.tipo_asistencia,
      DATE_FORMAT(p.fecha, '%d-%m-%Y') AS fecha,
      CONCAT(per.nombre, ' ', per.apellido) AS jefe_dotacion,
      p.parte_escrito
    FROM partes p
    LEFT JOIN personal per ON p.jefe_dotacion = per.legajo
    WHERE 1=1
  `;

  const params = [];

  if (jefeDotacion) {
    query += ` AND p.jefe_dotacion = ?`;
    params.push(jefeDotacion);
  }
  if (tipoAsistencia) {
    query += ` AND p.tipo_asistencia = ?`;
    params.push(tipoAsistencia);
  }
  if (startDate) {
    query += ` AND p.fecha >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND p.fecha <= ?`;
    params.push(endDate);
  }

  query += ` ORDER BY p.fecha DESC`;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error al obtener datos:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json(results);
    }
  });
};

// Obtener parte por ID o número
const obtenerPartePorId = (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      p.id AS parte_id,
      p.numero_parte,
      p.nombre_denunciante,
      p.apellido_denunciante,
      p.documento_denunciante,
      p.direccion,
      p.tipo_asistencia,
      DATE_FORMAT(p.fecha, '%d-%m-%Y') AS fecha,
      CONCAT(per.nombre, ' ', per.apellido) AS jefe_dotacion,
      p.parte_escrito
    FROM partes p
    LEFT JOIN personal per ON p.jefe_dotacion = per.legajo
    WHERE p.id = ? OR p.numero_parte = ?
  `;
  db.query(query, [id, id], (err, results) => {
    if (err) {
      console.error('Error al obtener el parte:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else if (results.length === 0) {
      res.status(404).json(null);
    } else {
      res.json(results[0]);
    }
  });
};

// Crear nuevo parte
const crearParte = async (req, res) => {
  const {
    nombre_denunciante,
    apellido_denunciante,
    documento_denunciante,
    direccion,
    tipo_asistencia,
    jefe_dotacion,
    parte_escrito,
    fecha
  } = req.body;

  try {
    const [rows] = await db.promise().query(`
      SELECT IFNULL(MAX(CAST(SUBSTRING_INDEX(numero_parte, '/', 1) AS UNSIGNED)), 0) + 1 AS next_parte 
      FROM partes
      WHERE numero_parte LIKE CONCAT('%/', YEAR(CURDATE()))
    `);

    const nextParte = rows[0]?.next_parte || 1;
    const numeroParte = `${nextParte}/${new Date().getFullYear()}`;

    const [result] = await db.promise().query(
      `INSERT INTO partes (nombre_denunciante, apellido_denunciante, documento_denunciante, direccion, tipo_asistencia, jefe_dotacion, parte_escrito, fecha, numero_parte)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre_denunciante,
        apellido_denunciante,
        documento_denunciante,
        direccion,
        tipo_asistencia,
        jefe_dotacion,
        parte_escrito,
        fecha,
        numeroParte
      ]
    );

    await registrarBitacora(
      jefe_dotacion,
      'Alta de parte de emergencia',
      `Se registró el parte ${numeroParte} denunciado por ${nombre_denunciante} ${apellido_denunciante}`
    );

    res.json({ success: 'Reporte agregado correctamente', reportId: result.insertId, numeroParte });
  } catch (error) {
    console.error('Error al agregar el reporte:', error);
    res.status(500).json({ error: 'Error en el servidor al agregar el reporte' });
  }
};

// Eliminar parte por ID
const eliminarParte = (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM partes WHERE id = ?';

  db.query(query, [id], async (err, result) => {
    if (err) {
      console.error('Error al eliminar el reporte:', err);
      res.status(500).json({ error: 'Error en el servidor al eliminar el reporte' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Reporte no encontrado' });
    } else {
      await registrarBitacora(
        0,
        'Eliminación de parte de emergencia',
        `Se eliminó el parte con ID ${id}`
      );
      res.json({ success: 'Reporte eliminado correctamente' });
    }
  });
};

// Tipos de asistencia únicos
const obtenerTiposAsistencia = (req, res) => {
  const query = `
    SELECT DISTINCT tipo_asistencia FROM partes ORDER BY tipo_asistencia ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener tipos de asistencia:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      const tiposAsistencia = results.map(row => row.tipo_asistencia);
      res.json(tiposAsistencia);
    }
  });
};

// Reporte resumen agrupado
const obtenerReporteResumen = (req, res) => {
  const { jefeDotacion, tipoAsistencia, startDate, endDate } = req.query;

  let query = `SELECT tipo_asistencia, COUNT(*) AS cantidad FROM partes WHERE 1=1`;
  const params = [];

  if (jefeDotacion) {
    query += ` AND jefe_dotacion = ?`;
    params.push(jefeDotacion);
  }
  if (tipoAsistencia) {
    query += ` AND tipo_asistencia = ?`;
    params.push(tipoAsistencia);
  }
  if (startDate) {
    query += ` AND fecha >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND fecha <= ?`;
    params.push(endDate);
  }

  query += ` GROUP BY tipo_asistencia`;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error al obtener reportes:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json(results);
    }
  });
};

module.exports = {
  obtenerPartes,
  obtenerPartePorId,
  crearParte,
  eliminarParte,
  obtenerTiposAsistencia,
  obtenerReporteResumen
};