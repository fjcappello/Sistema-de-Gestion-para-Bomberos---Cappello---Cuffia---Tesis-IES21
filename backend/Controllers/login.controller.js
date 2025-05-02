/*const db = require('../DB/db.js');
const bcryptjs = require('bcryptjs');
const { registrarLog } = require('../Middlewares/logSeguridadLogger.js');
const { generarToken } = require('./token.controller.js');

// LOGIN
const loginUsuario = function (req, res) {
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
      return res.status(500).json({ success: false, error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.json({ success: false, error: 'Legajo o contraseña incorrectos' });
    }

    const { nombre_completo, primer_ingreso, clave } = results[0];
    let valida = false;

    if (primer_ingreso == 0) {
      try {
        valida = await bcryptjs.compare(password, clave);
      } catch (error) {
        console.error('Error al comparar contraseñas:', error);
        return res.status(500).json({ success: false, error: 'Error interno' });
      }
    } else if (password === clave) {
      valida = true;
    }

    if (valida) {
      registrarLog(
        legajo,
        `El usuario ${nombre_completo} inició sesión correctamente.`
      );

      //Generar token con callback
      const token = generarToken(legajo, (err, token) => {
        if (err) {
          console.error('Error al generar el token:', err);
          return res.status(500).json({ success: false, error: 'Error al generar el token' });
        }
      
        return res.json({
          success: true,
          nombreCompleto: nombre_completo,
          primerIngreso: primer_ingreso,
          token: token
        });
      });
      
      return res.json({ success: true, nombreCompleto: nombre_completo, primerIngreso: primer_ingreso, token: token });
    } else {
      return res.json({ success: false, error: 'Legajo o contraseña incorrectos' });
    }
  });
};

// CAMBIAR CONTRASEÑA
const cambiarPassword = function (req, res) {
  const { legajo, nuevaPassword } = req.body;

  if (!legajo || !nuevaPassword) {
    return res.status(400).json({ success: false, error: 'Faltan datos: legajo y password son requeridos' });
  }

  bcryptjs.hash(nuevaPassword, 10, (errHash, hash) => {
    if (errHash) {
      console.error('Error al hashear la nueva contraseña:', errHash);
      return res.status(500).json({ success: false, error: 'Error interno' });
    }

    const query = `
      UPDATE login SET contraseña = ?, primer_ingreso = false WHERE legajo = ?
    `;

    db.query(query, [hash, legajo], (err, result) => {
      if (err) {
        console.error('Error al cambiar la contraseña:', err);
        return res.status(500).json({ success: false, error: 'Error al cambiar la contraseña' });
      }

      registrarLog(
        legajo,
        `Cambio de contraseña: El usuario ${legajo} cambió su contraseña`
      );

      return res.status(202).json({ success: true, message: 'Contraseña actualizada correctamente' });
    });
  });
};

module.exports = {
  loginUsuario,
  cambiarPassword
};*/

const db = require('../DB/db.js');
const bcryptjs = require('bcryptjs');
const { registrarLog } = require('../Middlewares/logSeguridadLogger.js');
const { generarToken } = require('./token.controller.js');

// LOGIN
const loginUsuario = function (req, res) {
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
      return res.status(500).json({ success: false, error: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.json({ success: false, error: 'Legajo o contraseña incorrectos' });
    }

    const { nombre_completo, primer_ingreso, clave } = results[0];
    let valida = false;

    if (primer_ingreso == 0) {
      try {
        valida = await bcryptjs.compare(password, clave);
      } catch (error) {
        console.error('Error al comparar contraseñas:', error);
        return res.status(500).json({ success: false, error: 'Error interno' });
      }
    } else if (password === clave) {
      valida = true;
    }

    if (valida) {
      registrarLog(
        legajo,
        `El usuario ${nombre_completo} inició sesión correctamente.`
      );

      // ⚠️ generarToken con callback
      generarToken(legajo, (err, token) => {
        if (err) {
          console.error('Error al generar el token:', err);
          return res.status(500).json({ success: false, error: 'Error al generar el token' });
        }
        return res.json({
          success: true,
          nombreCompleto: nombre_completo,
          primerIngreso: primer_ingreso,
          token
        });
      });

    } else {
      return res.json({ success: false, error: 'Legajo o contraseña incorrectos' });
    }
  });
};

// CAMBIAR CONTRASEÑA
const cambiarPassword = function (req, res) {
  const { legajo, nuevaPassword } = req.body;

  if (!legajo || !nuevaPassword) {
    return res.status(400).json({ success: false, error: 'Faltan datos: legajo y password son requeridos' });
  }

  bcryptjs.hash(nuevaPassword, 10, (errHash, hash) => {
    if (errHash) {
      console.error('Error al hashear la nueva contraseña:', errHash);
      return res.status(500).json({ success: false, error: 'Error interno' });
    }

    const query = `
      UPDATE login SET contraseña = ?, primer_ingreso = false WHERE legajo = ?
    `;

    db.query(query, [hash, legajo], (err, result) => {
      if (err) {
        console.error('Error al cambiar la contraseña:', err);
        return res.status(500).json({ success: false, error: 'Error al cambiar la contraseña' });
      }

      registrarLog(
        legajo,
        `Cambio de contraseña: El usuario ${legajo} cambió su contraseña`
      );

      return res.status(202).json({ success: true, message: 'Contraseña actualizada correctamente' });
    });
  });
};

module.exports = {
  loginUsuario,
  cambiarPassword
};
