const express = require("express");
const router = express.Router();
const {
  obtenerPartes,
  obtenerPartePorId,
  crearParte,
  eliminarParte,
  obtenerTiposAsistencia,
  obtenerReporteResumen,
  crearBitacora,
  obtenerBitacora,
} = require("../Controllers/partes.controller");

router.get("/partesemergencias", obtenerPartes);
router.get("/partesemergencias/:id", obtenerPartePorId);
router.post("/partesemergencias", crearParte);
router.delete("/eliminarEmergencia/:id", eliminarParte);

router.get("/tipos_asistencia", obtenerTiposAsistencia);
router.get("/reportes", obtenerReporteResumen);

router.post("/bitacora", crearBitacora);
router.get("/bitacora/:parte_id", obtenerBitacora);

module.exports = router;
