const jwt = require("jsonwebtoken");
const db = require("../DB/db.js");

const generarToken = function (legajo, callback) {
  const query = `
    SELECT p.legajo, p.id_rol, r.rol, l.primer_ingreso
    FROM personal AS p
    INNER JOIN rol AS r ON p.id_rol = r.id_rol
    INNER JOIN login AS l ON p.legajo = l.legajo
    WHERE p.legajo = ?;
  `;

  db.query(query, [legajo], (err, resultados) => {
    if (err) {
      console.error("Error al generar el token (DB):", err);
      return callback(err);
    }

    if (!resultados || resultados.length === 0) {
      return callback(new Error("Usuario no encontrado"));
    }

    const { legajo, id_rol, rol, primer_ingreso } = resultados[0];

    // Detectar primer ingreso
    if (primer_ingreso === 1) {
      return callback(null, { firstLogin: true });
    }

    const payload = { legajo, id_rol, rol };
    const secret = "Esperanto3012"; // Cambiar por process.env.SECRET en producción
    const options = { expiresIn: "8h" };

    try {
      const newToken = jwt.sign(payload, secret, options);
      callback(null, { token: newToken });
    } catch (errToken) {
      console.error("Error firmando el token:", errToken);
      callback(errToken);
    }
  });
};

module.exports = {
  generarToken,
};
