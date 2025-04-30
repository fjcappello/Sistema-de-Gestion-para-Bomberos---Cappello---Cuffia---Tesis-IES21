const express = require('express');
const router = express.Router();

const {
    getMoviles,
    addMovil,
    updateMovil,
    getEstadosMoviles,
    editMovil
} = require('../Controllers/moviles.controller');

// Devuelve todos los móviles registrados.
router.get('/moviles', getMoviles);

// Agrega un nuevo móvil.
router.post('/moviles_agregar', addMovil);

// Actualiza un móvil existente por su número interno.
router.put('/moviles_actualizar/:interno', updateMovil);

// Edita campos específicos de un móvil por ID.
router.put('/moviles_editar/:id', editMovil);

// Devuelve todos los estados posibles para móviles.
router.get('/estados_moviles', getEstadosMoviles);

module.exports = router;