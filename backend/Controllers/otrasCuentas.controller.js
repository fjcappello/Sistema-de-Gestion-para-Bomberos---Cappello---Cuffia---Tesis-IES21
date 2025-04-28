const db = require('../DB/db.js');

const recuperarUsuarios = function recuperarUsuarios(req, res) {
    const query = 'SELECT legajo, CONCAT(nombre, " ", apellido) as nombre, situacion_id, id_rol FROM personal';
    try {
        db.query(query, (error, results) => {
            if (error) {
                console.error('Error al recuperar usuarios:', error);
                return res.status(500).json({ error: 'Error al recuperar usuarios' });
            }
            return res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error inesperado:', error);
        res.status(500).json({ error: 'Error inesperado' });
    }
};


const restablecerCuenta = function restablecerCuenta(req, res){
    
};

const activarDesactivarCuenta = function activarDesactivarCuenta(req, res){};

const cambiarPermisosCuenta = function cambiarPermisosCuenta(req, res){};

const recuperarPermisos = function recuperarPermisos(req, res){
    const query = 'SELECT * FROM rol';
    try {
        db.query(query, (error, results) => {
            if (error) {
                console.error('Error al recuperar permisos:', error);
                return res.status(500).json({ error: 'Error al recuperar permisos' });
            }
            return res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error inesperado:', error);
        res.status(500).json({ error: 'Error inesperado' });
    }
};

const recuperarEstado = function recuperarEstado(req, res){
    const query = 'SELECT * FROM situaciones';
    try {
        db.query(query, (error, results) => {
            if (error) {
                console.error('Error al recuperar estados:', error);
                return res.status(500).json({ error: 'Error al recuperar estados' });
            }
            return res.status(200).json(results);
        });
    } catch (error) {
        console.error('Error inesperado:', error);
        res.status(500).json({ error: 'Error inesperado' });
    }
};

module.exports = {
    recuperarUsuarios,
    restablecerCuenta,
    activarDesactivarCuenta,
    cambiarPermisosCuenta,
    recuperarPermisos,
    recuperarEstado
};
