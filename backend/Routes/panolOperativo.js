const express = require("express");
const router = express.Router();
const { subirImagen } = require("../Middlewares/subirImagenes.js");
const {
  recuperarElementos,
  recuperarEstados,
  recuperarTipos,
  recuperarMarcas,
  agregarElemento,
  recuperarAsignaciones,
  editarElemento,
} = require("../Controllers/panolOperativo.controller.js");

// Recupera los elementos del Pañol Operativo filtrados.
router.post("/recuperar-elementosPanol", recuperarElementos);

// Recupera los estados de los elementos del Pañol Operativo.
router.get("/recuperar-estadosPanol", recuperarEstados);

// Recupera los tipos de elementos del Pañol Operativo.
router.get("/recuperar-tiposPanol", recuperarTipos);

// Recupera las marcas de elementos del Pañol Operativo.
router.get("/recuperar-marcasPanol", recuperarMarcas);

// Recupera las asignaciones de elementos del Pañol Operativo.
router.get("/recuperar-asignacionPanol", recuperarAsignaciones);

//Agregar elementos al Pañol Operativo.
router.post("/agregar-elementoPanol", agregarElemento);

// Cambia el estado de un elemento del Pañol Operativo.
router.put("/cambiar-estadosPanol", subirImagen.single("foto"), editarElemento);

module.exports = router;
