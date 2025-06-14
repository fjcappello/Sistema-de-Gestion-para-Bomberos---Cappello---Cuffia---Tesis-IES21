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
} = require("../Controllers/personal.controller");

router.get("/", obtenerPersonal);
router.get("/nombres", obtenerNombres);
router.post("/personal", crearPersonal);
router.put("/personal/:legajo", actualizarPersonal);
router.delete("/personal/:legajo", eliminarPersonal);

router.get("/jerarquias", obtenerJerarquias);
router.get("/situaciones", obtenerSituaciones);

module.exports = router;
