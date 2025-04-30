const express = require('express');
const router = express.Router();
const {recuperarUsuarios, restablecerCuenta, cambiarPermisosCuenta, recuperarPermisos} = require('../Controllers/otrasCuentas.controller.js');

// GET para recuperar todos los usuarios
router.get('/usuarios', recuperarUsuarios);

// GET para recuperar todos los permisos
router.get('/permisos', recuperarPermisos);

// PUT para restablecer contraseña de un usuario
router.put('/restablecer-cuenta', restablecerCuenta);

// PUT para cambiar permisos de una cuenta
router.put('/cambiar-permisos', cambiarPermisosCuenta);

module.exports = router;
