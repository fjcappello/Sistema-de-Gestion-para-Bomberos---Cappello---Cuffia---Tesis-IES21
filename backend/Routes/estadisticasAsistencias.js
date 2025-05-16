const express = require("express");
const router = express.Router();
const {
  obtenerRankingAsistencias,
  obtenerRankingHoras,
  obtenerAsistenciaPorDia,
  obtenerAsistenciaPorMes,
  obtenerAsistenciaPorJerarquia,
} = require("../Controllers/estadisticasAsistencias.controller");

// Rutas
router.get("/ranking-asistencias", obtenerRankingAsistencias);
router.get("/ranking-horas", obtenerRankingHoras);
router.get("/asistencia-dia", obtenerAsistenciaPorDia);
router.get("/asistencia-mes", obtenerAsistenciaPorMes);
router.get("/asistencia-jerarquia", obtenerAsistenciaPorJerarquia);

module.exports = router;
