const express = require('express');
const router = express.Router();
const { obtenerLog } = require('../Controllers/logSeguridad.controller.js');

// Devuelve los registros de seguridad (bitácora) con filtros opcionales.
router.get('/registro_seguridad', obtenerLog);

// Registra el cierre de sesión de un usuario.
router.post('/logout', (req, res) => {
  const { usuario_id, accion } = req.body;
  const { registrarLog } = require('../Middlewares/logSeguridadLogger.js');

  registrarLog(usuario_id, accion);
  res.json({ success: true });
});

module.exports = router;
