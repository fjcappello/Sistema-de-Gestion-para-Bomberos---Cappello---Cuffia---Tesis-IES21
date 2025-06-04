const db = require("../DB/db.js");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

// Obtener movimientos visibles
const obtenerMovimientos = (req, res) => {
  const query = `
    SELECT m.id, m.timestamp, m.nombre, m.apellido, m.dni, e.descripcion AS estado
    FROM movimientos_cuartel m
    JOIN estados_movimiento_cuartel e ON m.estado_movimiento_cuartel_id = e.id
    WHERE m.visible = 1
    ORDER BY m.timestamp DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener movimientos:", err);
      return res.status(500).json({ error: "Error al consultar movimientos" });
    }
    res.json(results);
  });
};

// Registrar nuevo movimiento
const registrarMovimiento = (req, res) => {
  const { legajo_personal, nombre, apellido, dni, estado_movimiento_cuartel_id } = req.body;

  const query = `
    INSERT INTO movimientos_cuartel (legajo_personal, nombre, apellido, dni, estado_movimiento_cuartel_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [legajo_personal || null, nombre, apellido, dni, estado_movimiento_cuartel_id],
    async (err, result) => {
      if (err) {
        console.error("Error al registrar movimiento:", err);
        return res.status(500).json({ error: "Error al registrar movimiento" });
      }

      registrarLog(
        legajo_personal || 0,
        `Registro de movimiento: se registró un ${
          estado_movimiento_cuartel_id === 1 ? "ingreso" : "egreso"
        } para ${nombre} ${apellido} (${dni})`
      );

      res.json({ success: true, id: result.insertId });
    }
  );
};

// Ocultar un movimiento (soft delete)
const ocultarMovimiento = (req, res) => {
  const { id } = req.params;
  const query = "UPDATE movimientos_cuartel SET visible = 0 WHERE id = ?";

  db.query(query, [id], async (err, result) => {
    if (err) {
      console.error("Error al ocultar movimiento:", err);
      return res.status(500).json({ error: "Error al ocultar movimiento" });
    }

    registrarLog(
      0,
      `Ocultamiento de movimiento: se ocultó el movimiento ID ${id}`
    );

    res.json({ success: true });
  });
};

module.exports = {
  obtenerMovimientos,
  registrarMovimiento,
  ocultarMovimiento,
};
