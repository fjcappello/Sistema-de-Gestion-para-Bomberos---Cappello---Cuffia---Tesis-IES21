const db = require('../DB/db.js');

const registrarBitacora = (usuario_id, accion) => {
  db.query(
    'INSERT INTO bitacora (usuario_id, accion) VALUES (?, ?)',
    [usuario_id, accion],
    (err) => {
      if (err) {
        console.error('Error registrando en la bitácora:', err);
      }
    }
  );
};

module.exports = { registrarBitacora };
