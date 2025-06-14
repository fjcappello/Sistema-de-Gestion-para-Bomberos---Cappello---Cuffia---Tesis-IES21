const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");
const db = require("../DB/db.js");

const getMoviles = async (req, res) => {
  const query = `
    SELECT m.id, m.interno, m.marca, m.modelo, m.dominio, m.vin, m.kilometraje_inicial, m.kilometraje_actual, m.fecha_service,
           m.estado_id, me.nombre_estado AS estado
    FROM moviles m
    JOIN moviles_estados me ON m.estado_id = me.id
    ORDER BY m.interno;
  `;
  try {
    const [results] = await db.query(query);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error al obtener móviles:", err);
    res.status(500).json({ success: false, error: "Error del servidor" });
  }
};

const addMovil = async (req, res) => {
  const {
    interno,
    marca,
    modelo,
    dominio,
    vin,
    kilometraje,
    fecha_service,
    estado_id,
  } = req.body;
  const query = `
    INSERT INTO moviles (interno, marca, modelo, dominio, vin, kilometraje_inicial, kilometraje_actual, fecha_service, estado_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    interno,
    marca,
    modelo,
    dominio,
    vin,
    kilometraje,
    kilometraje,
    fecha_service,
    estado_id,
  ];

  try {
    const [result] = await db.query(query, values);
    res.status(201).json({
      success: true,
      message: "Móvil agregado correctamente",
      id: result.insertId,
    });
    if (req.body.usuario_id) {
      registrarLog(req.body.usuario_id, `Agregó el móvil ${interno}`);
    }
  } catch (err) {
    console.error("Error al agregar móvil:", err);
    res.status(500).json({ success: false, error: "Error al agregar móvil" });
  }
};

const updateMovil = async (req, res) => {
  const { interno } = req.params;
  const { marca, modelo, dominio, vin, fecha_service, estado_id } = req.body;

  const query = `
    UPDATE moviles
    SET marca = ?, modelo = ?, dominio = ?, vin = ?, fecha_service = ?, estado_id = ?
    WHERE interno = ? AND estado_id IN (1, 2)
  `;

  const values = [
    marca,
    modelo,
    dominio,
    vin,
    fecha_service,
    estado_id,
    interno,
  ];

  try {
    const [result] = await db.query(query, values);
    if (result.affectedRows === 0) {
      res
        .status(400)
        .json({
          error:
            "No se pudo actualizar. El móvil podría no existir o estar dado de baja.",
        });
    } else {
      res.status(200).json({ success: true, message: "Móvil actualizado correctamente" });
      if (req.body.usuario_id) {
        registrarLog(
          req.body.usuario_id,
          `Modificó móvil con interno ${interno}`
        );
      }
    }
  } catch (err) {
    console.error("Error al actualizar móvil:", err);
    res.status(500).json({ success: false, error: "Error al actualizar móvil" });
  }
};

const getEstadosMoviles = async (req, res) => {
  const query = "SELECT id, nombre_estado AS nombre FROM moviles_estados";
  try {
    const [results] = await db.query(query);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error al obtener estados de móviles:", err);
    res.status(500).json({ success: false, error: "Error al obtener estados" });
  }
};

const editMovil = async (req, res) => {
  const { id } = req.params;
  const campos = [];
  const valores = [];

  if (req.body.kilometraje_actual !== undefined) {
    campos.push("kilometraje_actual = ?");
    valores.push(req.body.kilometraje_actual);
  }
  if (req.body.fecha_service !== undefined) {
    campos.push("fecha_service = ?");
    valores.push(req.body.fecha_service);
  }
  if (req.body.estado_id !== undefined) {
    campos.push("estado_id = ?");
    valores.push(req.body.estado_id);
  }

  if (campos.length === 0) {
    return res
      .status(400)
      .json({ error: "No se especificaron campos a modificar" });
  }

  valores.push(id);
  const query = `UPDATE moviles SET ${campos.join(", ")} WHERE id = ?`;

  try {
    const [result] = await db.query(query, valores);
    res.status(200).json({ success: true, message: "Móvil actualizado correctamente" });
    if (req.body.usuario_id) {
      registrarLog(req.body.usuario_id, `Editó campos del móvil ID ${id}`);
    }
  } catch (err) {
    console.error("Error al actualizar móvil:", err);
    res.status(500).json({ success: false, error: "Error al actualizar móvil" });
  }
};

module.exports = {
  getMoviles,
  addMovil,
  updateMovil,
  getEstadosMoviles,
  editMovil,
};
