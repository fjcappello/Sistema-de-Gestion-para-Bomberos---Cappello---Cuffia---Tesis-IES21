const jwt = require('jsonwebtoken');
const db = require('../DB/db.js');

const generarToken = async function(leg) {
    try {
        const query = `SELECT p.legajo, l.id_rol, r.rol 
                       FROM personal AS p 
                       INNER JOIN rol AS r ON p.id_rol = r.id_rol
                       WHERE p.legajo = ? AND p.activo = 1`;
        const [resultados] = await db.query(query, [leg]);
        if (!resultados || resultados.length === 0) {
            throw new Error('Usuario no encontrado o inactivo');
        }
        const { legajo, id_rol } = resultados[0];
        const payload = { legajo, id_rol };
        const secret = 'Esperanto3012'; // Usar process.env.SECRET en producción
        const options = { expiresIn: '8h' };

        const token = jwt.sign(payload, secret, options);
        return token;
    } catch (error) {
        console.error('Error al generar el token:', error.message);
        throw error;
    }
};

module.exports = {
    generarToken
};