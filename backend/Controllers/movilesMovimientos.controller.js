const db = require("../DB/db.js");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

const registrarSalida = (req, res) => {
  const { movil_id, chofer_id, destino, jefe_dotacion, dotacion } = req.body;

  db.query(
    "SELECT kilometraje_actual FROM moviles WHERE id = ?",
    [movil_id],
    (err, rows) => {
      if (err || rows.length === 0) {
        return res
          .status(500)
          .json({ error: "Error al obtener el kilometraje actual del móvil" });
      }
      const km_salida = rows[0].kilometraje_actual;
      const fecha_salida = new Date();
      const query = `
      INSERT INTO moviles_movimientos (movil_id, fecha_salida, legajo_chofer, destino, kilometraje_salida, legajo_jefe_dotacion_movil)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
      db.query(
        query,
        [movil_id, fecha_salida, chofer_id, destino, km_salida, jefe_dotacion],
        (err, result) => {
          if (err) {
            console.error("Error al registrar salida:", err);
            return res.status(500).json({ error: "Error al registrar salida" });
          }
          const movimiento_id = result.insertId;
          if (Array.isArray(dotacion) && dotacion.length > 0) {
            const dotacionQuery = `
          INSERT INTO moviles_dotacion_personal (movil_movimiento_id, legajo_personal)
          VALUES ?
        `;
            const dotacionValues = dotacion.map((personal_id) => [
              movimiento_id,
              personal_id,
            ]);
            db.query(dotacionQuery, [dotacionValues], (err2) => {
              if (err2) {
                console.error("Error al registrar dotación:", err2);
                return res
                  .status(500)
                  .json({ error: "Error al registrar dotación" });
              }
              res.json({ success: "Salida registrada", movimiento_id });
              registrarLog(
                jefe_dotacion,
                `Registró salida de móvil ID ${movil_id} hacia "${destino}"`
              );
            });
          } else {
            res.json({ success: "Salida registrada", movimiento_id });
            registrarLog(
              jefe_dotacion,
              `Registró salida de móvil ID ${movil_id} hacia "${destino}"`
            );
          }
        }
      );
    }
  );
};

const registrarRetorno = (req, res) => {
  const { id } = req.params;
  const { kilometraje_final, novedades } = req.body;
  const fecha_retorno = new Date();

  // Validar que el kilometraje_final no sea menor al km_salida
  db.query(
    "SELECT kilometraje_salida FROM moviles_movimientos WHERE id = ?",
    [id],
    (err, rows) => {
      if (err || rows.length === 0) {
        return res
          .status(500)
          .json({ error: "Error al validar kilometraje de salida" });
      }
      const km_salida = rows[0].kilometraje_salida;
      if (kilometraje_final < km_salida) {
        return res
          .status(400)
          .json({
            error: "El kilometraje final no puede ser menor al de salida",
          });
      }

      const updateMovimiento = `
      UPDATE moviles_movimientos
      SET fecha_retorno = ?, kilometraje_final = ?, novedades = ?
      WHERE id = ?
    `;

      db.query(
        updateMovimiento,
        [fecha_retorno, kilometraje_final, novedades, id],
        (err) => {
          if (err) {
            console.error("Error al registrar retorno:", err);
            return res
              .status(500)
              .json({ error: "Error al registrar retorno" });
          }

          db.query(
            "SELECT movil_id FROM moviles_movimientos WHERE id = ?",
            [id],
            (err2, rows2) => {
              if (err2 || rows2.length === 0) {
                console.error("Error al obtener el ID del móvil:", err2);
                return res
                  .status(500)
                  .json({ error: "No se pudo determinar el móvil" });
              }

              const movil_id = rows2[0].movil_id;

              db.query(
                "UPDATE moviles SET kilometraje_actual = ? WHERE id = ?",
                [kilometraje_final, movil_id],
                (err3) => {
                  if (err3) {
                    console.error("Error al actualizar kilometraje:", err3);
                    return res
                      .status(500)
                      .json({ error: "Error al actualizar kilometraje" });
                  }

                  console.log(
                    "✔ Retorno registrado con éxito para movimiento ID:",
                    id
                  );
                  res.json({ success: "Retorno registrado" });
                  registrarLog(
                    null,
                    `Registró retorno del móvil ID ${movil_id}, movimiento ID ${id}`
                  );
                }
              );
            }
          );
        }
      );
    }
  );
};

const obtenerMovilesEnSalida = (req, res) => {
  const query = `
    SELECT mm.id, m.interno, mm.fecha_salida, CONCAT(p.nombre, ' ', p.apellido) AS chofer, mm.destino
    FROM moviles_movimientos mm
    JOIN moviles m ON mm.movil_id = m.id
    JOIN personal p ON mm.legajo_chofer = p.legajo
    WHERE mm.fecha_retorno IS NULL
    ORDER BY mm.fecha_salida DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener móviles en salida:", err);
      return res
        .status(500)
        .json({ error: "Error al obtener móviles en salida" });
    }

    res.json(results);
  });
};

const obtenerMovimientos = (req, res) => {
  const query = `
    SELECT mm.*, m.interno, CONCAT(p.nombre, ' ', p.apellido) AS chofer
    FROM moviles_movimientos mm
    JOIN moviles m ON mm.movil_id = m.id
    JOIN personal p ON mm.legajo_chofer = p.legajo
    ORDER BY mm.fecha_salida DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener movimientos:", err);
      return res.status(500).json({ error: "Error al obtener movimientos" });
    }

    res.json(results);
  });
};

module.exports = {
  registrarSalida,
  registrarRetorno,
  obtenerMovilesEnSalida,
  obtenerMovimientos,
};
