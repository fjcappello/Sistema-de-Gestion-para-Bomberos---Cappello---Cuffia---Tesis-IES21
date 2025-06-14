const db = require("../DB/db.js");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

const registrarSalida = async (req, res) => {
  const { movil_id, chofer_id, destino, jefe_dotacion, dotacion } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT kilometraje_actual FROM moviles WHERE id = ?",
      [movil_id]
    );

    if (rows.length === 0) {
      return res
        .status(500)
        .json({ success: false, error: "Error al obtener el kilometraje actual del móvil" });
    }

    const km_salida = rows[0].kilometraje_actual;
    const fecha_salida = new Date();

    const query = `
      INSERT INTO moviles_movimientos (movil_id, fecha_salida, chofer_id, destino, km_salida, jefe_dotacion)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      movil_id,
      fecha_salida,
      chofer_id,
      destino,
      km_salida,
      jefe_dotacion,
    ]);

    const movimiento_id = result.insertId;

    if (Array.isArray(dotacion) && dotacion.length > 0) {
      const dotacionQuery = `
          INSERT INTO moviles_dotacion (movimiento_id, personal_id)
          VALUES ?
        `;
      const dotacionValues = dotacion.map((personal_id) => [
        movimiento_id,
        personal_id,
      ]);
      await db.query(dotacionQuery, [dotacionValues]);
    }

    res.status(201).json({ success: true, message: "Salida registrada", movimiento_id });
    registrarLog(
      jefe_dotacion,
      `Registró salida de móvil ID ${movil_id} hacia "${destino}"`
    );
  } catch (err) {
    console.error("Error al registrar salida:", err);
    res.status(500).json({ success: false, error: "Error al registrar salida" });
  }
};

const registrarRetorno = async (req, res) => {
  const { id } = req.params;
  const { kilometraje_final, novedades } = req.body;
  const fecha_retorno = new Date();

  try {
    const [rows] = await db.query(
      "SELECT km_salida FROM moviles_movimientos WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(500)
        .json({ success: false, error: "Error al validar kilometraje de salida" });
    }

    const km_salida = rows[0].km_salida;
    if (kilometraje_final < km_salida) {
      return res
        .status(400)
        .json({
          success: false,
          error: "El kilometraje final no puede ser menor al de salida",
        });
    }

    const updateMovimiento = `
      UPDATE moviles_movimientos
      SET fecha_retorno = ?, kilometraje_final = ?, novedades = ?
      WHERE id = ?
    `;

    await db.query(updateMovimiento, [fecha_retorno, kilometraje_final, novedades, id]);

    const [rows2] = await db.query(
      "SELECT movil_id FROM moviles_movimientos WHERE id = ?",
      [id]
    );

    if (rows2.length === 0) {
      console.error("Error al obtener el ID del móvil");
      return res.status(500).json({ success: false, error: "No se pudo determinar el móvil" });
    }

    const movil_id = rows2[0].movil_id;

    await db.query(
      "UPDATE moviles SET kilometraje_actual = ? WHERE id = ?",
      [kilometraje_final, movil_id]
    );

    console.log("✔ Retorno registrado con éxito para movimiento ID:", id);
    res.status(200).json({ success: true, message: "Retorno registrado" });
    registrarLog(
      null,
      `Registró retorno del móvil ID ${movil_id}, movimiento ID ${id}`
    );
  } catch (err) {
    console.error("Error al registrar retorno:", err);
    res.status(500).json({ success: false, error: "Error al registrar retorno" });
  }
};

const obtenerMovilesEnSalida = async (req, res) => {
  const query = `
    SELECT mm.id, m.interno, mm.fecha_salida, CONCAT(p.nombre, ' ', p.apellido) AS chofer, mm.destino
    FROM moviles_movimientos mm
    JOIN moviles m ON mm.movil_id = m.id
    JOIN personal p ON mm.chofer_id = p.legajo
    WHERE mm.fecha_retorno IS NULL
    ORDER BY mm.fecha_salida DESC
  `;

  try {
    const [results] = await db.query(query);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error al obtener móviles en salida:", err);
    res.status(500).json({ success: false, error: "Error al obtener móviles en salida" });
  }
};

const obtenerMovimientos = async (req, res) => {
  const query = `
    SELECT mm.*, m.interno, CONCAT(p.nombre, ' ', p.apellido) AS chofer
    FROM moviles_movimientos mm
    JOIN moviles m ON mm.movil_id = m.id
    JOIN personal p ON mm.chofer_id = p.legajo
    ORDER BY mm.fecha_salida DESC
  `;

  try {
    const [results] = await db.query(query);
    res.status(200).json({ success: true, data: results });
  } catch (err) {
    console.error("Error al obtener movimientos:", err);
    res.status(500).json({ success: false, error: "Error al obtener movimientos" });
  }
};

module.exports = {
  registrarSalida,
  registrarRetorno,
  obtenerMovilesEnSalida,
  obtenerMovimientos,
};
