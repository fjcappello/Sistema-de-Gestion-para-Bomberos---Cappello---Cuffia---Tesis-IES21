require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3001;
const path = require("path");


const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = isProduction
  ? [process.env.FRONTEND_URL_PROD]
  : [
      process.env.FRONTEND_URL_DEV || "http://localhost:3000",
      process.env.FRONTEND_URL_DEV_2 || "http://16.171.18.247",
    ];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.some(o => origin === o || origin.startsWith(o))) {
      return callback(null, true);
    } else {
      const msg = `CORS policy no permite el acceso desde el origen ${origin}`;
      return callback(new Error(msg), false);
    }
  }
}));

app.use(express.json());
app.use("/resources", express.static(path.join(__dirname, "..", "resources"))); 

app.use(require("./Routes/login"));
app.use("/personal", require("./Routes/personal"));
app.use(require("./Routes/partes"));
app.use(require("./Routes/mensajes"));
app.use(require("./Routes/movimientos"));
app.use(require("./Routes/logSeguridad"));
app.use(require("./Routes/moviles"));
app.use(require("./Routes/movimientoMoviles"));
app.use(require("./Routes/estadisticas"));
app.use(require("./Routes/otrasCuentas"));
app.use("/panol", require("./Routes/panolOperativo"));
app.use(require('./Routes/estadisticasAsistencias'));

const { logoutUsuario } = require("./Controllers/login.controller");
app.post("/logout", logoutUsuario);

const listenHost = isProduction ? "0.0.0.0" : "localhost";

app.listen(PORT, listenHost, () => {
  console.log(`Servidor API escuchando en http://${listenHost}:${PORT}`);
});