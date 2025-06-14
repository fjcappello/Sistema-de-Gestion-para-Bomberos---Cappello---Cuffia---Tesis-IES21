require("dotenv").config();
const jwt = require("jsonwebtoken");
const db = require("../DB/db.js");

const generarToken = async function (legajo) {
  const query = `
    SELECT p.legajo, p.id_rol, r.rol 
    FROM personal AS p 
    INNER JOIN rol AS r ON p.id_rol = r.id_rol
    WHERE p.legajo = ? AND p.situacion_id = 1;
  `;

  try {
    const [resultados] = await db.query(query, [legajo]);

    if (!resultados || resultados.length === 0) {
      throw new Error("Usuario no encontrado o inactivo");
    }

    const { legajo: userLegajo, id_rol, rol } = resultados[0];
    const payload = { legajo: userLegajo, id_rol, rol };
    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: "8h" };

    const token = jwt.sign(payload, secret, options);
    return token;
  } catch (error) {
    console.error("Error al generar el token:", error.message);
    throw error;
  }
};

module.exports = {
  generarToken,
};
