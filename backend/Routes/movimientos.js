const express = require('express');
const router = express.Router();
const {
  obtenerMovimientos,
  registrarMovimiento,
  ocultarMovimiento
} = require('../Controllers/movimientos.controller');

// Devuelve todos los movimientos visibles del cuartel.
router.get('/movimientos_cuartel', obtenerMovimientos);

// Registra un nuevo ingreso o egreso en el cuartel.
router.post('/movimientos_cuartel', registrarMovimiento);

// Oculta un movimiento por su ID.
router.put('/movimientos_cuartel/:id/ocultar', ocultarMovimiento);

module.exports = router;