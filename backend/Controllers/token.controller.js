/*const jwt = require('jsonwebtoken');
const db = require('../DB/db.js');

const generarToken = async function(leg) {
    try {
        const query = `SELECT p.legajo, l.id_rol, r.rol 
                       FROM personal AS p 
                       INNER JOIN rol AS r ON p.id_rol = r.id_rol
                       WHERE p.legajo = ? AND p.activo = 1;`
        const [resultados] = await db.query(query, [leg]);
        if (!resultados || resultados.length === 0) {
            throw new Error('Usuario no encontrado o inactivo');
        }
        const { legajo, id_rol, rol} = resultados[0];
        const payload = { legajo, id_rol, rol};
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
}*/

const jwt = require("jsonwebtoken");
const db = require("../DB/db.js");

const generarToken = function (legajo, callback) {
  const query = `
    SELECT p.legajo, p.rol_id AS id_rol, r.rol 
    FROM personal AS p 
    INNER JOIN rol AS r ON p.rol_id = r.id
    WHERE p.legajo = ? AND p.situacion_id = 1;
  `;

  db.query(query, [legajo], (err, resultados) => {
    if (err) {
      console.error("Error al generar el token (DB):", err);
      return callback(err);
    }

    if (!resultados || resultados.length === 0) {
      return callback(new Error("Usuario no encontrado o inactivo"));
    }

    const { legajo, id_rol, rol } = resultados[0];
    const payload = { legajo, id_rol, rol };
    const secret = "Esperanto3012"; // Cambiar por process.env.SECRET en producción
    const options = { expiresIn: "8h" };

    try {
      const token = jwt.sign(payload, secret, options);
      callback(null, token);
    } catch (errToken) {
      console.error("Error firmando el token:", errToken);
      callback(errToken);
    }
  });
};

module.exports = {
  generarToken,
};
