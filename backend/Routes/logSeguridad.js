const express = require("express");
const router = express.Router();
const { obtenerLog } = require("../Controllers/logSeguridad.controller.js");

// Obtener todos los registros de registro_seguridad con filtros opcionales
router.get("/registro_seguridad", obtenerLog);

module.exports = router;
