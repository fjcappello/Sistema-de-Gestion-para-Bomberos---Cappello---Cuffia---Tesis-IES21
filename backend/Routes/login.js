const express = require('express');
const router = express.Router();
const { loginUsuario, cambiarPassword } = require('../Controllers/login.controller.js');

router.post('/login', loginUsuario);

router.post('/cambiar-password', cambiarPassword);

module.exports = router;