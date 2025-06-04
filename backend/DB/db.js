const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bd_sigb_normalizada",
  port: 3306,
});

db.connect((err) => {
  if (err) console.error("Error de conexión a MySQL:", err);
  else console.log("Conectado a MySQL");
});

module.exports = db;
