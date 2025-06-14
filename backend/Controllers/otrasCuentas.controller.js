const db = require("../DB/db.js");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

const recuperarUsuarios = async function recuperarUsuarios(req, res) {
  const query = `
        SELECT legajo, CONCAT(nombre, " ", apellido) AS nombre, situacion_id, id_rol FROM personal`;
  try {
    const [results] = await db.query(query);
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "No se encontraron usuarios." });
    }
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error al recuperar usuarios:", error);
    return res.status(500).json({ success: false, error: "Error al recuperar usuarios" });
  }
};

const recuperarPermisos = async function recuperarPermisos(req, res) {
  const query = "SELECT id_rol, rol FROM rol";
  try {
    const [results] = await db.query(query);
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "No se encontraron roles." });
    }
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error al recuperar permisos:", error);
    return res.status(500).json({ success: false, error: "Error al recuperar permisos" });
  }
};

const restablecerCuenta = async function restablecerCuenta(req, res) {
  const { legajo } = req.body;
  if (!legajo) {
    return res.status(400).json({ success: false, error: "Falta el legajo." });
  }
  const query = `UPDATE login 
        SET primer_ingreso = 1, contraseña = (
        SELECT documento FROM personal WHERE legajo = ?)
        WHERE legajo = ?;`;
  try {
    const [results] = await db.query(query, [legajo, legajo]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Legajo no encontrado." });
    }
    res.status(200).json({ success: true, message: "Contraseña restablecida correctamente." });
    registrarLog(legajo, "Restableció la cuenta del usuario");
  } catch (error) {
    console.error("Error al restablecer cuenta:", error);
    return res.status(500).json({ success: false, error: "Error al restaurar la contraseña." });
  }
};

const cambiarPermisosCuenta = async function cambiarPermisosCuenta(req, res) {
  const query = "UPDATE personal SET id_rol = ? WHERE legajo = ?;";
  const { legajo, id_rol } = req.body;

  if (!legajo || !id_rol) {
    return res.status(400).json({ success: false, error: "Faltan datos requeridos." });
  }
  try {
    const [results] = await db.query(query, [id_rol, legajo]);
    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Legajo no encontrado." });
    }
    res.status(200).json({ success: true, message: "Permisos actualizados correctamente." });
    registrarLog(legajo, `Cambió los permisos del usuario al rol ID ${id_rol}`);
  } catch (error) {
    console.error("Error en la base de datos:", error);
    return res.status(500).json({ success: false, error: "Error al actualizar permisos." });
  }
};

module.exports = {
  recuperarUsuarios,
  restablecerCuenta,
  cambiarPermisosCuenta,
  recuperarPermisos,
};
