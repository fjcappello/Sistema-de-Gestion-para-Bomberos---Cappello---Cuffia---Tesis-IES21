const express = require('express');
const multer = require('multer');


const subirImagen = multer({ dest: 'resources/' });


module.exports = {
    subirImagen
}



