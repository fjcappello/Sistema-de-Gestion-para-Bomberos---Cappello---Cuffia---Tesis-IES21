const db = require("../DB/db");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

// Obtener todos los partes con filtros
const obtenerPartes = async (req, res) => {
  const { jefeDotacion, tipoAsistencia, startDate, endDate, denunciante } =
    req.query;

  let query = `
    SELECT DISTINCT
      p.id AS parte_id,
      p.numero_parte,
      p.nombre_denunciante,
      p.apellido_denunciante,
      p.documento_denunciante,
      p.direccion,
      p.tipo_asistencia,
      DATE_FORMAT(p.fecha, '%d-%m-%Y') AS fecha,
      CONCAT(per.nombre, ' ', per.apellido) AS jefe_dotacion,
      e.descripcion AS estado,
      p.parte_escrito
    FROM partes p
    LEFT JOIN personal per ON p.jefe_dotacion = per.legajo
    LEFT JOIN estado e ON p.id_estado = e.id_estado
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
  if (denunciante) {
    query += ` AND CONCAT(p.nombre_denunciante, ' ', p.apellido_denunciante) LIKE ?`;
    const denuncianteParametro = `%${denunciante}%`;
    params.push(denuncianteParametro);
  }

  query += ` AND p.activo = 1`;
  query += ` ORDER BY p.fecha DESC`;

  try {
    const [results] = await db.query(query, params);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error al obtener datos:", err);
    res.status(500).json({ success: false, error: "Error en el servidor" });
  }
};

// Obtener parte por ID o número
const obtenerPartePorId = async (req, res) => {
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
  try {
    const [results] = await db.query(query, [id, id]);
    if (results.length === 0) {
      res.status(404).json({ success: false, error: "No encontrado" });
    } else {
      res.status(200).json({ success: true, data: results[0] });
    }
  } catch (err) {
    console.error("Error al obtener el parte:", err);
    res.status(500).json({ success: false, error: "Error en el servidor" });
  }
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
    fecha,
  } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT IFNULL(MAX(CAST(SUBSTRING_INDEX(numero_parte, '/', 1) AS UNSIGNED)), 0) + 1 AS next_parte 
      FROM partes
      WHERE numero_parte LIKE CONCAT('%/', YEAR(CURDATE()))
    `);

    const nextParte = rows[0]?.next_parte || 1;
    const numeroParte = `${nextParte}/${new Date().getFullYear()}`;

    const [result] = await db.query(
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
        numeroParte,
      ]
    );

    registrarLog(
      jefe_dotacion,
      `Alta de parte de emergencia: se registró el parte ${numeroParte} denunciado por ${nombre_denunciante} ${apellido_denunciante}`
    );

    res.status(201).json({
      success: true,
      message: "Creado correctamente",
      id: result.insertId,
      numeroParte,
    });
  } catch (error) {
    console.error("Error al agregar el reporte:", error);
    res.status(500).json({ success: false, error: "Error en el servidor" });
  }
};

// Eliminar parte por ID
const eliminarParte = async (req, res) => {
  const { id } = req.params;
  const query = "UPDATE partes SET activo = 0 WHERE id = ?";

  try {
    const [result] = await db.query(query, [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, error: "No encontrado" });
    } else {
      registrarLog(
        0,
        `Eliminación de parte de emergencia: se eliminó el parte con ID ${id}`
      );
      res.status(200).json({ success: true, message: "Reporte eliminado correctamente" });
    }
  } catch (err) {
    console.error("Error al eliminar el reporte:", err);
    res.status(500).json({ success: false, error: "Error en el servidor" });
  }
};

// Tipos de asistencia únicos
const obtenerTiposAsistencia = async (req, res) => {
  const query = `
    SELECT DISTINCT tipo_asistencia FROM partes ORDER BY tipo_asistencia ASC
  `;

  try {
    const [results] = await db.query(query);
    const tiposAsistencia = results.map((row) => row.tipo_asistencia);
    res.status(200).json({ success: true, data: tiposAsistencia });
  } catch (err) {
    console.error("Error al obtener tipos de asistencia:", err);
    res.status(500).json({ success: false, error: "Error en el servidor" });
  }
};

// Reporte resumen agrupado
const obtenerReporteResumen = async (req, res) => {
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

  try {
    const [results] = await db.query(query, params);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error al obtener reportes:", err);
    res.status(500).json({ success: false, error: "Error en el servidor" });
  }
};

// Crear bitácora asociada a una emergencia
const crearBitacora = async (req, res) => {
  const { id_personal, reporte, parte_id } = req.body;
  if (!id_personal || !reporte || !parte_id) {
    return res
      .status(400)
      .json({ success: false, error: "Faltan datos requeridos" });
  }
  const insertQuery =
    "INSERT INTO bitacora (id_personal, reporte) VALUES (?, ?)";
  try {
    const [result] = await db.query(insertQuery, [id_personal, reporte]);
    const id_bitacora_nuevo = result.insertId;
    const updateQuery =
      "UPDATE partes SET id_bitacora = ?, id_estado = 0 WHERE id = ?";
    try {
      await db.query(updateQuery, [id_bitacora_nuevo, parte_id]);
      if (id_personal) {
        registrarLog(id_personal, `Creó una bitácora asociada al parte ID ${parte_id}`);
      }
      res.status(201).json({
        success: true,
        message: "Bitácora creada y parte actualizado",
        id_bitacora: id_bitacora_nuevo,
      });
    } catch (err) {
      console.error("Error al actualizar parte:", err);
      res
        .status(500)
        .json({ success: false, error: "Error en el servidor" });
    }
  } catch (err) {
    console.error("Error al crear bitácora:", err);
    res
      .status(500)
      .json({ success: false, error: "Error en el servidor" });
  }
};

// Obtener bitácora asociada a una emergencia
const obtenerBitacora = async (req, res) => {
  const { parte_id } = req.params;
  const query = `
    SELECT b.id_bitacora, b.reporte
    FROM bitacora b
    JOIN partes p ON b.id_bitacora = p.id_bitacora
    WHERE p.id = ?
  `;
  try {
    const [results] = await db.query(query, [parte_id]);
    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error al obtener la bitácora:", error);
    res.status(500).json({
      success: false,
      error: "Error en el servidor",
    });
  }
};

module.exports = {
  obtenerPartes,
  obtenerPartePorId,
  crearParte,
  eliminarParte,
  obtenerTiposAsistencia,
  obtenerReporteResumen,
  crearBitacora,
  obtenerBitacora,
};
