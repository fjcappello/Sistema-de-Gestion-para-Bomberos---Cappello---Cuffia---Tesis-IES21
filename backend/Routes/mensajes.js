const express = require('express');
const router = express.Router();
const {
  obtenerMensajesRecibidos,
  obtenerMensajesEnviados,
  enviarMensaje,
  marcarMensajeLeido
} = require('../Controllers/mensajes.controller.js');

// Devuelve los mensajes recibidos por el usuario.
router.get('/mensajes/recibidos/:legajo', obtenerMensajesRecibidos);

// Devuelve los mensajes enviados por el usuario.
router.get('/mensajes/enviados/:legajo', obtenerMensajesEnviados);

// Envía un nuevo mensaje.
router.post('/mensajes/enviar', enviarMensaje);

// Marca un mensaje como leído.
router.put('/mensajes/marcar-leido/:id', marcarMensajeLeido);

module.exports = router;