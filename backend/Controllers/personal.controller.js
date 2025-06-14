const db = require("../DB/db.js");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

const obtenerPersonal = async (req, res) => {
  const query = `
    SELECT 
      p.legajo,
      CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo,
      p.documento,
      DATE_FORMAT(p.nacimiento, '%d-%m-%Y') AS nacimiento,
      DATE_FORMAT(p.fecha_ingreso, '%d-%m-%Y') AS fecha_ingreso,
      j.jerarquia AS jerarquia,
      s.nombre AS situacion,
      p.fecha_revision_medica
    FROM personal p
    LEFT JOIN jerarquias j ON p.jerarquia_id = j.id
    LEFT JOIN situaciones s ON p.situacion_id = s.id
    ORDER BY p.legajo ASC
  `;

  try {
    const [results] = await db.query(query);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error al obtener datos de personal:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

const obtenerNombres = async (req, res) => {
  const query = `
    SELECT legajo AS id, nombre, apellido, CONCAT(nombre, " ", apellido) AS nombre_completo
    FROM personal
    ORDER BY nombre ASC
  `;
  try {
    const [results] = await db.query(query);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error al obtener nombres de personal:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

const crearPersonal = async (req, res) => {
  const {
    legajo,
    nombre,
    apellido,
    documento,
    nacimiento,
    fecha_ingreso,
    jerarquia_id,
    situacion_id,
    fecha_revision_medica,
  } = req.body;

  const personalQuery = `
    INSERT INTO personal (legajo, nombre, apellido, documento, nacimiento, fecha_ingreso, jerarquia_id, situacion_id, fecha_revision_medica)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.query(
      personalQuery,
      [
        legajo,
        nombre,
        apellido,
        documento,
        nacimiento,
        fecha_ingreso,
        jerarquia_id,
        situacion_id,
        fecha_revision_medica,
      ]
    );

    const loginQuery = `INSERT INTO login (legajo, contraseña) VALUES (?, ?)`;
    await db.query(loginQuery, [legajo, documento]);

    registrarLog(
      legajo,
      `Alta de personal: se dio de alta a ${nombre} ${apellido} (Legajo ${legajo})`
    );
    res.status(201).json({ success: true, message: "Creado correctamente" });
  } catch (err) {
    console.error("Error al agregar personal o crear login:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

const actualizarPersonal = async (req, res) => {
  const { legajo } = req.params;
  const { jerarquia_id, situacion_id, fecha_revision_medica } = req.body;

  const fields = [];
  const values = [];

  if (jerarquia_id !== undefined) {
    fields.push("jerarquia_id = ?");
    values.push(jerarquia_id);
  }
  if (situacion_id !== undefined) {
    fields.push("situacion_id = ?");
    values.push(situacion_id);
  }
  if (fecha_revision_medica !== undefined) {
    fields.push("fecha_revision_medica = ?");
    values.push(fecha_revision_medica);
  }

  if (fields.length === 0) {
    return res
      .status(400)
      .json({ success: false, error: "No se proporcionaron campos para actualizar" });
  }

  values.push(legajo);
  const query = `UPDATE personal SET ${fields.join(", ")} WHERE legajo = ?`;

  try {
    const [result] = await db.query(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "No encontrado" });
    }
    registrarLog(
      legajo,
      `Modificación de personal: se actualizaron datos del legajo ${legajo}`
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error al actualizar personal:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

const eliminarPersonal = async (req, res) => {
  const { legajo } = req.params;
  const query = `DELETE FROM personal WHERE legajo = ?`;

  try {
    const [result] = await db.query(query, [legajo]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "No encontrado" });
    }
    registrarLog(legajo, `Baja de personal: se eliminó el legajo ${legajo}`);
    res.status(200).json({ success: true, message: "Eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar personal:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

const obtenerJerarquias = async (req, res) => {
  const query = `SELECT id, jerarquia FROM jerarquias ORDER BY jerarquia ASC`;
  try {
    const [results] = await db.query(query);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error al obtener jerarquías:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

const obtenerSituaciones = async (req, res) => {
  const query = "SELECT id, nombre FROM situaciones ORDER BY nombre ASC";
  try {
    const [results] = await db.query(query);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error al obtener situaciones:", err);
    res.status(500).json({ success: false, error: "Error interno del servidor" });
  }
};

module.exports = {
  obtenerPersonal,
  obtenerNombres,
  crearPersonal,
  actualizarPersonal,
  eliminarPersonal,
  obtenerJerarquias,
  obtenerSituaciones,
};
