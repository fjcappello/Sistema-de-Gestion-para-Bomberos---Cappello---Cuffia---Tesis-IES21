const express = require('express');
const cors = require('cors');


const partesRoutes = require('./Routes/partes');
const personalRoutes = require('./Routes/personal');
const mensajesRoutes = require('./Routes/mensajes');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());


app.use(partesRoutes);
app.use(personalRoutes);
app.use(mensajesRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor API en http://localhost:${PORT}`);
});