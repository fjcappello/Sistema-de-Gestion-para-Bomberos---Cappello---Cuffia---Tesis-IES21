// Configura y lanza el servidor Express para la API de SIGBReact.

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware de CORS para permitir peticiones desde el frontend.
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware para parsear JSON en las solicitudes.
app.use(express.json());

// Rutas del sistema
app.use(require('./Routes/login'));
app.use(require('./Routes/personal'));
app.use(require('./Routes/partes'));
app.use(require('./Routes/mensajes'));
app.use(require('./Routes/movimientos'));
app.use(require('./Routes/logSeguridad')); 
app.use(require('./Routes/moviles'));

// Levanta el servidor en el puerto 3001
app.listen(PORT, () => {
  console.log(`Servidor API en http://localhost:${PORT}`);
});