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
      p.fecha_revision_medica,
      p.email
    FROM personal p
    LEFT JOIN jerarquias j ON p.jerarquia_id = j.id
    LEFT JOIN situaciones s ON p.situacion_id = s.id
    ORDER BY p.legajo ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener datos de personal:", err);
      res
        .status(500)
        .json({ error: "Error en el servidor al obtener datos de personal" });
    } else {
      res.json(results);
    }
  });
};

// Obtener nombres de personal
const obtenerNombres = (req, res) => {
  const query = `
    SELECT legajo AS id, nombre, apellido, CONCAT(nombre, " ", apellido) AS nombre_completo, email
    FROM personal
    ORDER BY nombre ASC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener nombres de personal:", err);
      res.status(500).json({ error: "Error en el servidor" });
    } else {
      res.json(results);
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
    id_rol,
    legajoOperador
  } = req.body;

  // Verificar si el legajo ya existe en login
  const verificarLoginQuery = `SELECT legajo FROM login WHERE legajo = ?`;

  db.query(verificarLoginQuery, [legajo], (err, results) => {
    if (err) {
      console.error("Error al verificar login:", err);
      return res.status(500).json({ success: false, message: "Error en el servidor al verificar login" });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: `El legajo ${legajo} ya está registrado en el sistema` });
    }

    // Insertar nuevo personal
    const personalQuery = `
      INSERT INTO personal (legajo, nombre, apellido, documento, nacimiento, fecha_ingreso, jerarquia_id, situacion_id, fecha_revision_medica, id_rol)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
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
        id_rol || 1,
      ],
      (err) => {
        if (err) {
          console.error("Error al agregar personal:", err);
          return res.status(500).json({ success: false, message: "Error en el servidor al agregar personal" });
        }

        // Crear login para el personal
        const loginQuery = `INSERT INTO login (legajo, contraseña) VALUES (?, ?)`;
        db.query(loginQuery, [legajo, documento], (err) => {
          if (err) {
            console.error("Error al crear login:", err);
            return res.status(500).json({ success: false, message: "Error en el servidor al crear login" });
          }

          registrarLog(
            legajoOperador,
            `Alta de personal: se dio de alta a ${nombre} ${apellido} (Legajo ${legajo})`
          );

          return res.json({ success: true, message: "Personal y login creados correctamente" });
        });
      }
    );
  });
};

// Actualizar datos de personal
const actualizarPersonal = (req, res) => {
  const {legajo, jerarquia_id, situacion_id, fecha_revision_medica, legajoOperador } = req.body;

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
      .json({ error: "No se proporcionaron campos para actualizar" });
  }

  values.push(legajo);
  const query = `UPDATE personal SET ${fields.join(", ")} WHERE legajo = ?`;

  db.query(query, values, async (err, result) => {
    if (err) {
      console.error("Error al actualizar personal:", err);
      res
        .status(500)
        .json({ error: "Error en el servidor al actualizar personal" });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: "Personal no encontrado" });
    } else {
      registrarLog(
        legajoOperador,
        `Modificación de personal: se actualizaron datos del legajo ${legajo}`
      );
      res.json({ success: true });
    }
  });
};

// Eliminar personal
const eliminarPersonal = (req, res) => {
  const { legajo, legajoOperador } = req.body;
  const query = `DELETE FROM personal WHERE legajo = ?`;

  db.query(query, [legajo], async (err, result) => {
    if (err) {
      console.error("Error al eliminar personal:", err);
      res
        .status(500)
        .json({ error: "Error en el servidor al eliminar personal" });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: "Personal no encontrado" });
    } else {
      registrarLog(legajoOperador, `Baja de personal: se eliminó el legajo ${legajo}`);
      res.json({ success: "Personal eliminado correctamente" });
    }
  });
};

// Jerarquías
const obtenerJerarquias = (req, res) => {
  const query = `SELECT id, jerarquia FROM jerarquias ORDER BY jerarquia ASC`;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener jerarquías:", err);
      res
        .status(500)
        .json({ error: "Error en el servidor al obtener jerarquías" });
    } else {
      res.json(results);
    }
  });
};

// Situaciones
const obtenerSituaciones = (req, res) => {
  const query = "SELECT id, nombre FROM situaciones ORDER BY nombre ASC";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener situaciones:", err);
      res
        .status(500)
        .json({ error: "Error en el servidor al obtener situaciones" });
    } else {
      res.json(results);
    }
  });
};

// Actualizar preferencias de notificaciones y mail

const actualizarPreferenciasNotificacion = (req, res) => {
  const { legajo } = req.params;
  const { email } = req.body;

  const query = `
    UPDATE personal
    SET email = ?
    WHERE legajo = ?
  `;
  db.query(query, [email, legajo], (err, result) => {
    if (err) {
      console.error("Error al actualizar preferencias:", err);
      res
        .status(500)
        .json({ error: "Error en el servidor al actualizar preferencias" });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: "Personal no encontrado" });
    } else {
      registrarLog(
        legajo,
        `Se actualizaron las preferencias de notificación y email del legajo ${legajo}`
      );
      res.json({ success: true });
    }
  });
};

const obtenerPersonalPorLegajo = (req, res) => {
  const { legajo } = req.params;
  const query = `
    SELECT legajo, nombre, apellido, email
    FROM personal
    WHERE legajo = ?
  `;
  db.query(query, [legajo], (err, results) => {
    if (err) {
      console.error("Error al obtener datos del personal:", err);
      return res
        .status(500)
        .json({ error: "Error en el servidor al obtener datos del personal" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Personal no encontrado" });
    }
    res.json(results[0]);
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
  actualizarPreferenciasNotificacion,
  obtenerPersonalPorLegajo,
};
