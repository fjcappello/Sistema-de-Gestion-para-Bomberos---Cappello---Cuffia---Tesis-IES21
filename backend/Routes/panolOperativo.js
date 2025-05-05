const express = require('express');
const router = express.Router();
const {subirImagen} = require('../Middlewares/subirImagenes.js')
const { recuperarElementos, recuperarEstados, recuperarTipos, cambiarEstados} = require('../Controllers/panolOperativo.controller.js');

// Recupera los elementos del Pañol Operativo filtrados.
router.get('/recuperar-elementosPanol', recuperarElementos);

// Recupera los estados de los elementos del Pañol Operativo.
router.get('/recuperar-estadosPanol', recuperarEstados);

// Recupera los tipos de elementos del Paañol Operativo.
router.get('/recuperar-tiposPanol', recuperarTipos);

// Cambia el estado de un elemento del Pañol Operativo.
router.put('/cambiar-estadosPanol', subirImagen.single('imagenElemento') ,cambiarEstados);

module.exports = router;