const express = require('express');
const router = express.Router();
const {
  obtenerPersonal,
  obtenerNombres,
  crearPersonal,
  actualizarPersonal,
  eliminarPersonal,
  obtenerJerarquias,
  obtenerSituaciones
} = require('../Controllers/personal.controller');

// Devuelve la lista completa del personal.
router.get('/personal', obtenerPersonal);

// Devuelve solo los nombres completos del personal.
router.get('/personal_nombres', obtenerNombres);

// Crea un nuevo registro de personal.
router.post('/personal', crearPersonal);

// Actualiza los datos de un personal por legajo.
router.put('/personal/:legajo', actualizarPersonal);

// Elimina un registro de personal por legajo.
router.delete('/personal/:legajo', eliminarPersonal);

// Devuelve todas las jerarquías disponibles.
router.get('/jerarquias', obtenerJerarquias);

// Devuelve todas las situaciones disponibles.
router.get('/situaciones', obtenerSituaciones);

module.exports = router;