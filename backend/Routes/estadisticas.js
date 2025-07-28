const express = require("express");
const router = express.Router();
const EstadisticasController = require("../Controllers/estadisticas.controller");

// Estadísticas simples por cantidad y tipo
router.get("/", EstadisticasController.obtenerEstadisticas);

// Estadísticas con filtros
router.get("/estadisticas_filtros", EstadisticasController.obtenerEstadisticasFiltradas);

// Servicios por tipo y hora
router.get("/por_tipo_y_hora", EstadisticasController.obtenerPorTipoYHora);

// Servicios por bombero
router.get("/por_bombero", EstadisticasController.obtenerPorBombero);

module.exports = router;
