const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;
const path = require("path");


const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  process.env.FRONTEND_URL_2 || "http://16.171.18.247",
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = `El CORS policy no permite el acceso desde el origen ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

app.use(express.json());
app.use("/resources", express.static(path.join(__dirname, "..", "resources"))); 

app.use(require("./Routes/login"));
app.use(require("./Routes/personal"));
app.use(require("./Routes/partes"));
app.use(require("./Routes/mensajes"));
app.use(require("./Routes/movimientos"));
app.use(require("./Routes/logSeguridad"));
app.use(require("./Routes/moviles"));
app.use(require("./Routes/movimientoMoviles"));
app.use(require("./Routes/estadisticas"));
app.use(require("./Routes/otrasCuentas"));
app.use(require("./Routes/panolOperativo"));
app.use(require('./Routes/estadisticasAsistencias'));

const { logoutUsuario } = require("./Controllers/login.controller");
app.post("/logout", logoutUsuario);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor API escuchando en http://0.0.0.0:${PORT}`);
});