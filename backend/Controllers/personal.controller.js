const db = require("../DB/db.js");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

// Obtener todos los registros de personal
const obtenerPersonal = (req, res) => {
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

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener datos de personal:", err);
      registrarLog(req.user?.legajo || 'SYSTEM_ACTION', 'Error al obtener datos de personal', err);
      res.status(500).json({
        status: "error",
        error: {
          code: "SERVER_ERROR",
          message: "Error en el servidor al obtener datos de personal",
        },
      });
    } else {
      res.status(200).json({
        status: "success",
        data: results,
        message: "Datos de personal obtenidos correctamente",
      });
    }
  });
};

// Obtener nombres de personal
const obtenerNombres = (req, res) => {
  const query = `
    SELECT legajo AS id, nombre, apellido, CONCAT(nombre, " ", apellido) AS nombre_completo
    FROM personal
    ORDER BY nombre ASC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener nombres de personal:", err);
      registrarLog(req.user?.legajo || 'SYSTEM_ACTION', 'Error al obtener nombres de personal', err);
      res.status(500).json({
        status: "error",
        error: {
          code: "SERVER_ERROR",
          message: "Error en el servidor al obtener nombres de personal",
        },
      });
    } else {
      res.status(200).json({
        status: "success",
        data: results,
        message: "Nombres de personal obtenidos correctamente",
      });
    }
  });
};

// Insertar nuevo personal
const crearPersonal = (req, res) => {
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

  // Input validation
  const validationErrors = [];
  if (!legajo || typeof legajo !== 'number' || !Number.isInteger(legajo)) {
    validationErrors.push("Legajo es obligatorio y debe ser un número entero.");
  }
  if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
    validationErrors.push("Nombre es obligatorio y debe ser una cadena de texto no vacía.");
  }
  if (!apellido || typeof apellido !== 'string' || apellido.trim() === '') {
    validationErrors.push("Apellido es obligatorio y debe ser una cadena de texto no vacía.");
  }
  if (!documento || (typeof documento !== 'string' && typeof documento !== 'number')) {
    validationErrors.push("Documento es obligatorio y debe ser una cadena de texto o un número.");
  }
  if (!nacimiento || isNaN(Date.parse(nacimiento))) {
    validationErrors.push("Nacimiento es obligatorio y debe ser una fecha válida.");
  }
  if (!fecha_ingreso || isNaN(Date.parse(fecha_ingreso))) {
    validationErrors.push("Fecha de ingreso es obligatoria y debe ser una fecha válida.");
  }
  if (!jerarquia_id || typeof jerarquia_id !== 'number' || !Number.isInteger(jerarquia_id)) {
    validationErrors.push("Jerarquía ID es obligatorio y debe ser un número entero.");
  }
  if (!situacion_id || typeof situacion_id !== 'number' || !Number.isInteger(situacion_id)) {
    validationErrors.push("Situación ID es obligatorio y debe ser un número entero.");
  }
  if (fecha_revision_medica !== null && fecha_revision_medica !== undefined && isNaN(Date.parse(fecha_revision_medica))) {
    validationErrors.push("Fecha de revisión médica debe ser una fecha válida o nula.");
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({
      status: "error",
      error: {
        code: "VALIDATION_ERROR",
        message: "Error de validación en los campos proporcionados.",
      },
      details: validationErrors,
    });
  }

  const personalQuery = `
    INSERT INTO personal (legajo, nombre, apellido, documento, nacimiento, fecha_ingreso, jerarquia_id, situacion_id, fecha_revision_medica)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.beginTransaction((err) => {
    if (err) {
      console.error("Error al iniciar transacción:", err);
      registrarLog(req.user?.legajo || legajo || 'SYSTEM_ACTION', 'Error al iniciar transacción para crear personal', err);
      return res.status(500).json({
        status: "error",
        error: {
          code: "SERVER_ERROR",
          message: "Error en el servidor al iniciar transacción para crear personal",
        },
      });
    }

    db.query(
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
      ],
      (err) => {
        if (err) {
          console.error("Error al agregar personal:", err);
          return db.rollback(() => {
            registrarLog(req.user?.legajo || legajo, `Error al agregar personal ${nombre} ${apellido} (Legajo ${legajo})`, err);
            res.status(500).json({
              status: "error",
              error: {
                code: "SERVER_ERROR",
                message: "Error en el servidor al agregar personal",
              },
            });
          });
        }

        const loginQuery = `INSERT INTO login (legajo, contraseña) VALUES (?, ?)`;
        db.query(loginQuery, [legajo, documento], (err) => {
          if (err) {
            console.error("Error al crear login:", err);
            return db.rollback(() => {
              registrarLog(req.user?.legajo || legajo, `Error al crear login para ${nombre} ${apellido} (Legajo ${legajo})`, err);
              res.status(500).json({
                status: "error",
                error: {
                  code: "SERVER_ERROR",
                  message: "Error en el servidor al crear login para personal",
                },
              });
            });
          }

          db.commit((err) => {
            if (err) {
              console.error("Error al hacer commit de la transacción:", err);
              return db.rollback(() => {
                registrarLog(req.user?.legajo || legajo, `Error al hacer commit para ${nombre} ${apellido} (Legajo ${legajo})`, err);
                res.status(500).json({
                  status: "error",
                  error: {
                    code: "SERVER_ERROR",
                    message: "Error en el servidor al confirmar la creación de personal",
                  },
                });
              });
            }

            registrarLog(
              legajo, // Using the specific legajo of the created user for success log
              `Alta de personal: se dio de alta a ${nombre} ${apellido} (Legajo ${legajo})`
            );
            res.status(201).json({
              status: "success",
              data: { legajo: legajo, nombre_completo: `${nombre} ${apellido}` },
              message: "Personal y login creados correctamente",
            });
          });
        });
      }
    );
  });
};

// Actualizar datos de personal
const actualizarPersonal = (req, res) => {
  const { legajo } = req.params;
  const { jerarquia_id, situacion_id, fecha_revision_medica } = req.body;

  // Input validation for legajo
  const parsedLegajo = parseInt(legajo);
  if (!legajo || typeof parsedLegajo !== 'number' || !Number.isInteger(parsedLegajo)) {
    return res.status(400).json({
      status: "error",
      error: {
        code: "VALIDATION_ERROR",
        message: "Legajo (parámetro) es obligatorio y debe ser un número entero.",
      },
    });
  }

  const fields = [];
  const values = [];
  const validationErrors = [];

  if (jerarquia_id !== undefined) {
    if (typeof jerarquia_id !== 'number' || !Number.isInteger(jerarquia_id)) {
      validationErrors.push("Jerarquía ID debe ser un número entero.");
    } else {
      fields.push("jerarquia_id = ?");
      values.push(jerarquia_id);
    }
  }
  if (situacion_id !== undefined) {
    if (typeof situacion_id !== 'number' || !Number.isInteger(situacion_id)) {
      validationErrors.push("Situación ID debe ser un número entero.");
    } else {
      fields.push("situacion_id = ?");
      values.push(situacion_id);
    }
  }
  if (fecha_revision_medica !== undefined) {
    if (fecha_revision_medica !== null && isNaN(Date.parse(fecha_revision_medica))) {
      validationErrors.push("Fecha de revisión médica debe ser una fecha válida o nula.");
    } else {
      fields.push("fecha_revision_medica = ?");
      values.push(fecha_revision_medica);
    }
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({
      status: "error",
      error: {
        code: "VALIDATION_ERROR",
        message: "Error de validación en los campos proporcionados.",
      },
      details: validationErrors,
    });
  }

  if (fields.length === 0) {
    return res.status(400).json({
      status: "error",
      error: {
        code: "VALIDATION_ERROR",
        message: "No se proporcionaron campos para actualizar.",
      },
    });
  }

  values.push(parsedLegajo);
  const query = `UPDATE personal SET ${fields.join(", ")} WHERE legajo = ?`;

  db.query(query, values, async (err, result) => {
    if (err) {
      console.error("Error al actualizar personal:", err);
      registrarLog(req.user?.legajo || parsedLegajo, `Error al actualizar datos del legajo ${parsedLegajo}`, err);
      res.status(500).json({
        status: "error",
        error: {
          code: "SERVER_ERROR",
          message: "Error en el servidor al actualizar personal",
        },
      });
    } else if (result.affectedRows === 0) {
      registrarLog(req.user?.legajo || parsedLegajo, `Intento de actualización de personal no encontrado, legajo ${parsedLegajo}`, null);
      res.status(404).json({
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Personal no encontrado",
        },
      });
    } else {
      registrarLog(
        parsedLegajo, // Using the specific legajo of the updated user
        `Modificación de personal: se actualizaron datos del legajo ${parsedLegajo}`
      );
      res.status(200).json({
        status: "success",
        data: { legajo: parsedLegajo },
        message: "Personal actualizado correctamente",
      });
    }
  });
};

// Eliminar personal
const eliminarPersonal = (req, res) => {
  const { legajo } = req.params;
  const query = `DELETE FROM personal WHERE legajo = ?`;

  db.query(query, [legajo], async (err, result) => {
    const parsedLegajoParam = parseInt(legajo); // For logging, in case of error before parsing
    if (err) {
      console.error("Error al eliminar personal:", err);
      registrarLog(req.user?.legajo || parsedLegajoParam, `Error al eliminar el legajo ${parsedLegajoParam}`, err);
      res.status(500).json({
        status: "error",
        error: {
          code: "SERVER_ERROR",
          message: "Error en el servidor al eliminar personal",
        },
      });
    } else if (result.affectedRows === 0) {
      registrarLog(req.user?.legajo || parsedLegajoParam, `Intento de eliminación de personal no encontrado, legajo ${parsedLegajoParam}`, null);
      res.status(404).json({
        status: "error",
        error: {
          code: "NOT_FOUND",
          message: "Personal no encontrado",
        },
      });
    } else {
      registrarLog(parsedLegajoParam, `Baja de personal: se eliminó el legajo ${parsedLegajoParam}`);
      res.status(200).json({
        status: "success",
        data: null,
        message: "Personal eliminado correctamente",
      });
    }
  });
};

// Jerarquías
const obtenerJerarquias = (req, res) => {
  const query = `SELECT id, jerarquia FROM jerarquias ORDER BY jerarquia ASC`;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener jerarquías:", err);
      registrarLog(req.user?.legajo || 'SYSTEM_ACTION', 'Error al obtener jerarquías', err);
      res.status(500).json({
        status: "error",
        error: {
          code: "SERVER_ERROR",
          message: "Error en el servidor al obtener jerarquías",
        },
      });
    } else {
      res.status(200).json({
        status: "success",
        data: results,
        message: "Jerarquías obtenidas correctamente",
      });
    }
  });
};

// Situaciones
const obtenerSituaciones = (req, res) => {
  const query = "SELECT id, nombre FROM situaciones ORDER BY nombre ASC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener situaciones:", err);
      registrarLog(req.user?.legajo || 'SYSTEM_ACTION', 'Error al obtener situaciones', err);
      res.status(500).json({
        status: "error",
        error: {
          code: "SERVER_ERROR",
          message: "Error en el servidor al obtener situaciones",
        },
      });
    } else {
      res.status(200).json({
        status: "success",
        data: results,
        message: "Situaciones obtenidas correctamente",
      });
    }
  });
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
