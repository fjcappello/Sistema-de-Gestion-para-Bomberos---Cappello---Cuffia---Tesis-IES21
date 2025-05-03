const express = require('express');
const router = express.Router();
const { loginUsuario, cambiarPassword, logoutUsuario } = require('../Controllers/login.controller.js');

// Verifica si el legajo y la contraseña son correctos
router.post('/login', loginUsuario);

// Cambia la contraseña y actualiza el estado de primer ingreso
router.post('/cambiar-password', cambiarPassword);

// Registra el cierre de sesión
router.post('/logout', logoutUsuario);

module.exports = router;