const express = require('express');
const router = express.Router();
const {recuperarUsuarios, restablecerCuenta, cambiarPermisosCuenta, recuperarPermisos} = require('../Controllers/otrasCuentas.controller');

// GET para recuperar todos los usuarios
router.get('/usuarios', recuperarUsuarios);

// GET para recuperar todos los usuarios
router.get('/usuarios', recuperarPermisos);

// PUT para restablecer contraseña de un usuario
router.put('/usuarios/:legajo/restablecer', restablecerCuenta);

// PUT para cambiar permisos de una cuenta
router.put('/usuarios/:legajo/permiso', cambiarPermisosCuenta);

module.exports = router;
