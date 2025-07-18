const express = require("express");
const multer = require("multer");

// Configuración de multer para subir imágenes
const subirImagen = multer({ dest: "resources/" });

module.exports = {
  subirImagen,
};
