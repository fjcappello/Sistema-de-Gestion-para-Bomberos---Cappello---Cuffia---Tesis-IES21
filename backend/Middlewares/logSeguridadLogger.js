const db = require('../DB/db.js');

const registrarLog = (usuario_id, accion) => {
  db.query(
    'INSERT INTO registro_seguridad (usuario_id, accion) VALUES (?, ?)',
    [usuario_id, accion],
    (err) => {
      if (err) {
        console.error('Error registrando en el log de seguridad:', err);
      }
    }
  );
};

module.exports = { registrarLog };
