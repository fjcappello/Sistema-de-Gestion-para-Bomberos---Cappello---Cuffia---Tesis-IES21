const db = require('../DB/db.js');

//Función para traer los usuarios.
const recuperarUsuarios = function (req, res) {
    const query = `
        SELECT legajo, CONCAT(nombre, " ", apellido) AS nombre, situacion_id, id_rol FROM personal`;
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error al recuperar usuarios:', error);
            return res.status(500).json({ error: 'Error al recuperar usuarios' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron usuarios.' });
        }

        return res.status(200).json(results);
    });
};

//Función para restablecer el login de una cuenta a su estado default
const restablecerCuenta = function restablecerCuenta(req, res){
    const query = 'UPDATE login SET  = ? WHERE legajo = ?;';
    const {legajo, id_rol} = req.body;
    const resultados = db.query(query, [,], ()=>{});
};

//Función para cambiar los permisos de la cuenta
const cambiarPermisosCuenta = function (req, res) {
    const query = 'UPDATE personal SET id_rol = ? WHERE legajo = ?;';
    const { legajo, id_rol } = req.body;
    if (!legajo || !id_rol) {
        return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }
    db.query(query, [id_rol, legajo], (error, results) => {
        if (error) {
            console.error('Error en la base de datos:', error);
            return res.status(500).json({ error: 'Error al actualizar permisos.' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Legajo no encontrado.' });
        }
        return res.status(200).json({ message: 'Permisos actualizados correctamente.' });
    });
};

//Función para traer los permisos
const recuperarPermisos = function (req, res) {
    const query = 'SELECT * FROM rol';
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error al recuperar permisos:', error);
            return res.status(500).json({ error: 'Error al recuperar permisos' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron roles.' });
        }
        return res.status(200).json(results);
    });
};

module.exports = {
    recuperarUsuarios,
    restablecerCuenta,
    cambiarPermisosCuenta,
    recuperarPermisos
};
