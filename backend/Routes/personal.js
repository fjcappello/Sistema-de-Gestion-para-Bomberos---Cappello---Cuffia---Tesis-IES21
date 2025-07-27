const express = require("express");
const router = express.Router();
const {
  obtenerPersonal,
  obtenerNombres,
  crearPersonal,
  actualizarPersonal,
  eliminarPersonal,
  obtenerJerarquias,
  obtenerSituaciones,
  actualizarPreferenciasNotificacion,
  obtenerPersonalPorLegajo,
} = require("../Controllers/personal.controller");

router.get("/personal", obtenerPersonal);
router.get("/personal_nombres", obtenerNombres);
router.post("/personal", crearPersonal);
router.put("/personal/:legajo", actualizarPersonal);
router.delete("/personal/:legajo", eliminarPersonal);
router.put("/personal/notificaciones/:legajo", actualizarPreferenciasNotificacion);
router.get("/personal/notificaciones/:legajo", obtenerPersonalPorLegajo);
router.get("/jerarquias", obtenerJerarquias);
router.get("/situaciones", obtenerSituaciones);

module.exports = router;