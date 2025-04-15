const express = require('express');
const router = express.Router();
const { obtenerLog } = require('../Controllers/logSeguridad.controller.js');

// Obtener todos los registros de registro_seguridad con filtros opcionales
router.get('/registro_seguridad', obtenerLog);

// Registrar cierre de sesión
router.post('/logout', (req, res) => {
  const { usuario_id, accion } = req.body;
  const { registrarLog } = require('../Middlewares/logSeguridadLogger.js');

  registrarBitacora(usuario_id, accion);
  res.json({ success: true });
});

module.exports = router;
