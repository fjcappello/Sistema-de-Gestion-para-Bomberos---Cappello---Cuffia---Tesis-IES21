const express = require("express");
const router = express.Router();
const {
  obtenerMensajesRecibidos,
  obtenerMensajesEnviados,
  enviarMensaje,
  marcarMensajeLeido,
} = require("../Controllers/mensajes.controller.js");

// GET recibidos
router.get("/mensajes/recibidos/:legajo", obtenerMensajesRecibidos);

// GET enviados
router.get("/mensajes/enviados/:legajo", obtenerMensajesEnviados);

// POST enviar
router.post("/mensajes/enviar", enviarMensaje);

// PUT marcar como leído
router.put("/mensajes/marcar-leido/:id", marcarMensajeLeido);

module.exports = router;
