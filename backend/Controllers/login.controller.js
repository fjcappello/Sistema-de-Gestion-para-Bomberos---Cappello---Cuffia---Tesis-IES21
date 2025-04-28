const db = require('../DB/db.js');
const bcryptjs = require('bcryptjs');
const { registrarLog } = require('../Middlewares/logSeguridadLogger.js');
const { generarToken } = require('./token.controller.js');


const loginUsuario = async function loginUsuario(req, res){
  let valida = false;
  const { legajo, password } = req.body;
  const query = `
    SELECT CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo, l.primer_ingreso, l.contraseña AS clave
    FROM personal p
    INNER JOIN login l ON p.legajo = l.legajo
    WHERE p.legajo = ? AND p.situacion_id = 1;
  `;

  db.query(query, [legajo], async (err, results) => {
    if (err) {
      console.error('Error en el servidor al intentar iniciar sesión:', err);
      res.status(500).json({ success: false, error: 'Error en el servidor' });
    }
    //VALIDACIÓN DE SI LA CONSULTAA DIO RESULTADOS 
    else if (results.length > 0) {
      const { nombre_completo, primer_ingreso, clave} = results[0];
      //Si es primer ingreso hago la comparacion normal, sino la de bcryptjs
      if(primer_ingreso == 0){
        valida = await bcryptjs.compare(password, clave);
      }
      else if(password === clave){
        valida = true;
      }
      //VALIDACION DEL ESTADO DEL PASS
      if(valida){
        // Registrar intento de inicio exitoso
        registrarLog(
          legajo,
          `El usuario ${nombre_completo} inició sesión correctamente.`
        );
        const token = await generarToken(legajo); 
        return res.json({ success: true, nombreCompleto: nombre_completo, primerIngreso: primer_ingreso, token: token });
      }
      else{
        return res.json({ success: false, error: 'Legajo o contraseña incorrectos' });
      }
    }
    else{
      return res.json({ success: false, error: 'Legajo o contraseña incorrectos' });
    } 
  });
};

const cambiarPassword = async function cambiarPassword(req, res){
  const { legajo, nuevaPassword } = req.body;
  const query = `
    UPDATE login SET contraseña = ?, primer_ingreso = false WHERE legajo = ?
  `;

  if (!legajo || !nuevaPassword) {
    return res.status(400).json({ success: false, error: 'Faltan datos: legajo y password son requeridos' });
  }

  const hash = await bcryptjs.hash(nuevaPassword, 10);

  db.query(query, [hash, legajo], async (err, result) => {
    if (err) {
      console.error('Error al cambiar la contraseña:', err);
      res.status(500).json({ success: false, error: 'Error al cambiar la contraseña' });
    } 
    else {
      registrarLog(
        legajo,
        `Cambio de contraseña: El usuario ${legajo} cambió su contraseña`
      );

      res.status(202).json({ success: true, message: 'Contraseña actualizada correctamente' });
    }
  });
};

module.exports = {
  loginUsuario,
  cambiarPassword
};