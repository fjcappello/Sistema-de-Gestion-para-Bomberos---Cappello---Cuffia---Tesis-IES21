const express = require('express');
const router = express.Router();
const {
  obtenerPartes,
  obtenerPartePorId,
  crearParte,
  eliminarParte,
  obtenerTiposAsistencia,
  obtenerReporteResumen,
  crearBitacora,
  obtenerBitacora
} = require('../Controllers/partes.controller');

// Devuelve todos los partes de emergencia.
router.get('/partesemergencias', obtenerPartes);

// Devuelve un parte específico por ID.
router.get('/partesemergencias/:id', obtenerPartePorId);

// Crea un nuevo parte de emergencia.
router.post('/partesemergencias', crearParte);

// Elimina un parte por ID.
router.delete('/partesemergencias/:id', eliminarParte);

// Devuelve los tipos de asistencia disponibles.
router.get('/tipos_asistencia', obtenerTiposAsistencia);

// Devuelve un reporte resumido por tipo de asistencia.
router.get('/reportes', obtenerReporteResumen);

// Crea una nueva bitácora asociada a un parte.
router.post('/bitacora', crearBitacora);

// Devuelve la bitácora de un parte específico.
router.get('/bitacora/:parte_id', obtenerBitacora);

module.exports = router;