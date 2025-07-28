const db = require("../DB/db.js");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

//Función para traer los usuarios.
const recuperarUsuarios = function recuperarUsuarios(req, res) {
  const query = `
        SELECT legajo, CONCAT(nombre, " ", apellido) AS nombre, situacion_id, id_rol FROM personal`;
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error al recuperar usuarios:", error);
      return res.status(500).json({ error: "Error al recuperar usuarios" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No se encontraron usuarios." });
    }

    return res.status(200).json(results);
  });
};

//Función para traer los permisos
const recuperarPermisos = function recuperarPermisos(req, res) {
  const query = "SELECT id_rol, rol FROM rol";
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error al recuperar permisos:", error);
      return res.status(500).json({ error: "Error al recuperar permisos" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "No se encontraron roles." });
    }
    return res.status(200).json(results);
  });
};

//Función para restablecer el login de una cuenta a su estado default
const restablecerCuenta = function restablecerCuenta(req, res) {
  const { legajo, legajoOperador } = req.body;
  if (!legajo) {
    return res.status(400).json({ error: "Falta el legajo." });
  }
  const query = `UPDATE login 
        SET primer_ingreso = 1, contraseña = (
        SELECT documento FROM personal WHERE legajo = ?)
        WHERE legajo = ?;`;
  db.query(query, [legajo, legajo], (error, results) => {
    if (error) {
      console.error("Error al restablecer cuenta:", error);
      return res
        .status(500)
        .json({ error: "Error al restaurar la contraseña." });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Legajo no encontrado." });
    }
    registrarLog(legajoOperador, `Restableció la cuenta del usuario ${legajo}`);
    res.status(200).json({ message: "Contraseña restablecida correctamente." });
  });
};

//Función para cambiar los permisos de la cuenta
const cambiarPermisosCuenta = function cambiarPermisosCuenta(req, res) {
  const query = "UPDATE personal SET id_rol = ? WHERE legajo = ?;";
  const { legajo, id_rol, legajoOperador } = req.body;

  if (!legajo || !id_rol) {
    return res.status(400).json({ error: "Faltan datos requeridos." });
  }
  db.query(query, [id_rol, legajo], (error, results) => {
    if (error) {
      console.error("Error en la base de datos:", error);
      return res.status(500).json({ error: "Error al actualizar permisos." });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Legajo no encontrado." });
    }
    res
      .status(200)
      .json({ message: "Permisos actualizados correctamente." });
    registrarLog(legajoOperador, `Cambió los permisos del usuario al rol ID ${id_rol}`);
  });
};

module.exports = {
  recuperarUsuarios,
  restablecerCuenta,
  cambiarPermisosCuenta,
  recuperarPermisos,
};
