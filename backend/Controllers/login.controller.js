const db = require('../DB/db.js');
const bcryptjs = require('bcryptjs');
const { registrarLog } = require('../Middlewares/logSeguridadLogger.js');
const { generarToken } = require('./token.controller.js');

// LOGIN
const loginUsuario = async function (req, res) {
  const { legajo, password } = req.body;
  const query = `
    SELECT CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo, l.primer_ingreso, l.contraseña AS clave, r.rol AS nombre_rol
    FROM personal p
    INNER JOIN login l ON p.legajo = l.legajo
    LEFT JOIN rol r ON p.id_rol = r.id_rol
    WHERE p.legajo = ? AND p.situacion_id = 1;
  `;

  try {
    const [results] = await db.query(query, [legajo]);

    if (results.length === 0) {
      return res.status(401).json({ success: false, error: 'Legajo o contraseña incorrectos' });
    }

    const { nombre_completo, primer_ingreso, clave, nombre_rol } = results[0];
    let valida = false;

    if (primer_ingreso == 0) {
      try {
        valida = await bcryptjs.compare(password, clave);
      } catch (error) {
        console.error('Error al comparar contraseñas:', error);
        return res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }
    } else if (password === clave) {
      valida = true;
    }

    if (valida) {
      registrarLog(
        legajo,
        `El usuario inició sesión correctamente.`
      );

      try {
        const token = await generarToken(legajo);
        return res.status(200).json({
          success: true,
          nombreCompleto: nombre_completo,
          primerIngreso: primer_ingreso,
          token,
          rol: nombre_rol
        });
      } catch (err) {
        console.error('Error al generar el token:', err);
        return res.status(500).json({ success: false, error: 'Error interno del servidor' });
      }

    } else {
      return res.status(401).json({ success: false, error: 'Legajo o contraseña incorrectos' });
    }
  } catch (err) {
    console.error('Error en el servidor al intentar iniciar sesión:', err);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

// CAMBIAR CONTRASEÑA
const cambiarPassword = async function (req, res) {
  const { legajo, nuevaPassword } = req.body;

  if (!legajo || !nuevaPassword) {
    return res.status(400).json({ success: false, error: 'Faltan datos: legajo y password son requeridos' });
  }

  try {
    const hash = await bcryptjs.hash(nuevaPassword, 10);

    const query = `
      UPDATE login SET contraseña = ?, primer_ingreso = false WHERE legajo = ?
    `;

    try {
      await db.query(query, [hash, legajo]);

      registrarLog(
        legajo,
        `Cambio de contraseña: El usuario ${legajo} cambió su contraseña`
      );

      return res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (err) {
      console.error('Error al cambiar la contraseña:', err);
      return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  } catch (errHash) {
    console.error('Error al hashear la nueva contraseña:', errHash);
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
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
    return res.status(500).json({ success: false, error: 'Error interno del servidor' });
  }
};

module.exports = {
  loginUsuario,
  cambiarPassword,
  logoutUsuario
};
