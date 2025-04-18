const express = require('express');
const router = express.Router();

const {
    getMoviles,
    addMovil,
    updateMovil
} = require('../Controllers/moviles.controller');

// Get moviles
router.get('/moviles', getMoviles);

// Add movil
router.post('/moviles_agregar', addMovil);

// Update movil
router.put('/moviles_actualizar/:interno', updateMovil);

module.exports = router;