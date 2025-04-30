const db = require('../DB/db.js');
const { registrarLog } = require('../Middlewares/logSeguridadLogger.js');

// Inicia sesión con legajo y contraseña.
const loginUsuario = (req, res) => {
  const { legajo, password } = req.body;
  const query = `
    SELECT CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo, l.primer_ingreso
    FROM personal p
    INNER JOIN login l ON p.legajo = l.legajo
    WHERE p.legajo = ? AND l.contraseña = ?
  `;

  db.query(query, [legajo, password], (err, results) => {
    if (err) {
      console.error('Error en el servidor al intentar iniciar sesión:', err);
      res.status(500).json({ success: false, error: 'Error en el servidor' });
    } else if (results.length > 0) {
      const { nombre_completo, primer_ingreso } = results[0];
      registrarLog(legajo, `El usuario ${nombre_completo} inició sesión correctamente.`);
      res.json({ success: true, nombreCompleto: nombre_completo, primerIngreso: primer_ingreso });
    } else {
      res.json({ success: false, error: 'Legajo o contraseña incorrectos' });
    }
  });
};

// Cambia la contraseña del usuario.
const cambiarPassword = (req, res) => {
  const { legajo, nuevaPassword } = req.body;
  const query = `
    UPDATE login SET contraseña = ?, primer_ingreso = false WHERE legajo = ?
  `;

  db.query(query, [nuevaPassword, legajo], (err) => {
    if (err) {
      console.error('Error al cambiar la contraseña:', err);
      res.status(500).json({ success: false, error: 'Error al cambiar la contraseña' });
    } else {
      registrarLog(legajo, `Cambio de contraseña: El usuario ${legajo} cambió su contraseña y desactivó el primer ingreso.`);
      res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    }
  });
};

module.exports = {
  loginUsuario,
  cambiarPassword
};