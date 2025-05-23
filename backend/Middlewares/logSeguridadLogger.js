const db = require('../DB/db.js');

const registrarLog = (usuario_id, accion, errorInfo = null) => {
  let logAccion = accion;
  if (errorInfo) {
    const errorMessage = typeof errorInfo === 'string' ? errorInfo : errorInfo.message;
    logAccion += ` - Error: ${errorMessage}`;
  }
  db.query(
    'INSERT INTO registro_seguridad (usuario_id, accion) VALUES (?, ?)',
    [usuario_id, logAccion],
    (err) => {
      if (err) {
        console.error('Error registrando en el log de seguridad:', err);
      }
    }
  );
};

module.exports = { registrarLog };
