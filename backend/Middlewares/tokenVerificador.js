require('dotenv').config();
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'No se proporcionó el token' });
  }

  const token = authHeader.split(' ')[1]; // Formato: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token no válido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Token inválido o expirado' });
    }

    req.user = decoded; // Esto te da acceso a legajo y id_rol desde cualquier ruta
    next();
  });
};

module.exports = verificarToken;
