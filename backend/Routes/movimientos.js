const express = require("express");
const router = express.Router();
const {
  obtenerMovimientos,
  registrarMovimiento,
  ocultarMovimiento,
} = require("../Controllers/movimientos.controller");

// GET movimientos visibles
router.get("/movimientos_cuartel", obtenerMovimientos);

// POST nuevo movimiento
router.post("/movimientos_cuartel", registrarMovimiento);

// PUT ocultar movimiento
router.put("/movimientos_cuartel/:id/ocultar", ocultarMovimiento);

module.exports = router;
