const express = require('express');
const router = express.Router();
const { obtenerBitacora } = require('../Controllers/bitacora.controller');

// Obtener todos los registros de bitácora con filtros opcionales
router.get('/obtenerBitacora', obtenerBitacora);

// Registrar cierre de sesión
router.post('/logout', (req, res) => {
  const { usuario_id, accion } = req.body;
  const { registrarBitacora } = require('../Middlewares/bitacoraLogger');

  registrarBitacora(usuario_id, accion);
  res.json({ success: true });
});

module.exports = router;
