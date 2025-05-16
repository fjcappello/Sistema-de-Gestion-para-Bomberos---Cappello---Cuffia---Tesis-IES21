const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;
const path = require("path");

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use("/resources", express.static(path.join(__dirname, "..", "resources"))); //para servir imagenes
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

app.use(require("./Routes/estadisticasAsistencias"));

app.use(require('./Routes/estadisticasAsistencias'));

const { logoutUsuario } = require("./Controllers/login.controller");
app.post("/logout", logoutUsuario);

app.listen(PORT, () => {
  console.log(`Servidor API en http://localhost:${PORT}`);
});
