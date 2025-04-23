const express = require('express');
const router = express.Router();

const {
  registrarSalida,
  registrarRetorno,
  obtenerMovilesEnSalida,
  obtenerMovimientos
} = require('../Controllers/movilesMovimientos.controller');

// Registrar salida
router.post('/moviles_salida', registrarSalida);

// Registrar retorno
router.put('/moviles_retorno/:id', registrarRetorno);

// Obtener móviles en salida
router.get('/moviles_en_salida', obtenerMovilesEnSalida);

// Obtener movimientos
router.get('/moviles_movimientos', obtenerMovimientos);

module.exports = router;
