const db = require('../DB/db.js');
const bcryptjs = require('bcryptjs');
const { registrarLog } = require('../Middlewares/logSeguridadLogger.js');
const { generarToken } = require('./token.controller.js');

// LOGIN
const loginUsuario = function (req, res) {
  const { legajo, password } = req.body;
  const query = `
    SELECT CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo, l.primer_ingreso, l.contraseña AS clave, r.rol AS nombre_rol
    FROM personal p
    INNER JOIN login l ON p.legajo = l.legajo
    LEFT JOIN rol r ON p.id_rol = r.id_rol
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

    const { nombre_completo, primer_ingreso, clave, nombre_rol } = results[0];
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
        `El usuario inició sesión correctamente.`
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
          token,
          rol: nombre_rol
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


// LOGOUT
const logoutUsuario = function (req, res) {


  const { legajo, nombreCompleto } = req.body;

  if (!legajo || !nombreCompleto) {
    return res.status(400).json({ success: false, error: 'Faltan datos: legajo y nombreCompleto son requeridos' });
  }

  try {
    registrarLog(legajo, `El usuario cerró sesión.`);
    return res.status(200).json({ success: true, message: 'Logout registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar logout:', error);
    return res.status(500).json({ success: false, error: 'Error interno al registrar logout' });
  }
};

module.exports = {
  loginUsuario,
  cambiarPassword,
  logoutUsuario
};
