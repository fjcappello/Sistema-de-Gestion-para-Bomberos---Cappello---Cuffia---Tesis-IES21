const express = require('express');
const router = express.Router();
const {
  obtenerPartes,
  obtenerPartePorId,
  crearParte,
  eliminarParte,
  obtenerTiposAsistencia,
  obtenerReporteResumen
} = require('../Controllers/partes.controller');

router.get('/partesemergencias', obtenerPartes);
router.get('/partesemergencias/:id', obtenerPartePorId);
router.post('/partesemergencias', crearParte);
router.delete('/partesemergencias/:id', eliminarParte);

router.get('/tipos_asistencia', obtenerTiposAsistencia);
router.get('/reportes', obtenerReporteResumen);

module.exports = router;