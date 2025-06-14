const db = require("../DB/db.js");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

const obtenerMovimientos = async (req, res) => {
  const query = `
    SELECT m.id, m.timestamp, m.nombre, m.apellido, m.dni, e.descripcion AS estado
    FROM movimientos_cuartel m
    JOIN estados_movimiento e ON m.estado_id = e.id
    WHERE m.visible = 1
    ORDER BY m.timestamp DESC
  `;
  try {
    const [results] = await db.query(query);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error al obtener movimientos:", err);
    res.status(500).json({ success: false, error: "Error al consultar movimientos" });
  }
};

const registrarMovimiento = async (req, res) => {
  const { id_personal, nombre, apellido, dni, estado_id } = req.body;

  const query = `
    INSERT INTO movimientos_cuartel (id_personal, nombre, apellido, dni, estado_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await db.query(query, [
      id_personal || null,
      nombre,
      apellido,
      dni,
      estado_id,
    ]);
    registrarLog(
      id_personal || 0,
      `Registro de movimiento: se registró un ${
        estado_id === 1 ? "ingreso" : "egreso"
      } para ${nombre} ${apellido} (${dni})`
    );
    res.status(201).json({ success: true, message: "Movimiento registrado", id: result.insertId });
  } catch (err) {
    console.error("Error al registrar movimiento:", err);
    res.status(500).json({ success: false, error: "Error al registrar movimiento" });
  }
};

const ocultarMovimiento = async (req, res) => {
  const { id } = req.params;
  const query = "UPDATE movimientos_cuartel SET visible = 0 WHERE id = ?";
  try {
    await db.query(query, [id]);
    registrarLog(
      0,
      `Ocultamiento de movimiento: se ocultó el movimiento ID ${id}`
    );
    res.status(200).json({ success: true, message: "Movimiento ocultado" });
  } catch (err) {
    console.error("Error al ocultar movimiento:", err);
    res.status(500).json({ success: false, error: "Error al ocultar movimiento" });
  }
};

module.exports = {
  obtenerMovimientos,
  registrarMovimiento,
  ocultarMovimiento,
};
