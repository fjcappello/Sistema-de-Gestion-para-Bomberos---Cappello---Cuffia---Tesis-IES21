const express = require("express");
const router = express.Router();

const {
  getMoviles,
  addMovil,
  updateMovil,
  getEstadosMoviles,
  editMovil,
} = require("../Controllers/moviles.controller");

// Get moviles
router.get("/moviles", getMoviles);

// Add movil
router.post("/moviles_agregar", addMovil);

// Update movil
router.put("/moviles_actualizar/:interno", updateMovil);

// Edit movil
router.put("/moviles_editar", editMovil);

// Get estados moviles
router.get("/estados_moviles", getEstadosMoviles);

module.exports = router;
