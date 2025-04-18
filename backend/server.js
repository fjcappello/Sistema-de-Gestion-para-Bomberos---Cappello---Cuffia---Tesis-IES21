const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());


app.use(require('./Routes/login'));
app.use(require('./Routes/personal'));
app.use(require('./Routes/partes'));
app.use(require('./Routes/mensajes'));
app.use(require('./Routes/movimientos'));
app.use(require('./Routes/logSeguridad')); 
app.use(require('./Routes/moviles'));

app.listen(PORT, () => {
  console.log(`Servidor API en http://localhost:${PORT}`);
});