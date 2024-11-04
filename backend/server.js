const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bd_sigb',
  port: 3004
});

db.connect(err => {
  if (err) console.error('Error de conexión a MySQL:', err);
  else console.log('Conectado a MySQL');
});

app.get('/partesemergencias', (req, res) => {
  const query = `
    SELECT 
      p.id AS parte_id,
      p.numero_parte,
      p.nombre_denunciante,
      p.apellido_denunciante,
      p.documento_denunciante,
      p.direccion,
      p.tipo_asistencia,
      DATE_FORMAT(p.fecha, '%d-%m-%Y') AS fecha,  -- Formato DD-MM-AAAA
      CONCAT(per.nombre, ' ', per.apellido) AS jefe_dotacion,
      p.parte_escrito
    FROM partes p
    LEFT JOIN personal per ON p.jefe_dotacion = per.legajo
    ORDER BY p.fecha DESC
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener datos:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json(results);
    }
  });
});

// Endpoint para obtener la lista de nombres de personal (jefes de dotación)
app.get('/personal_nombres', (req, res) => {
  const query = 'SELECT legajo AS id, CONCAT(nombre, " ", apellido) AS nombre_completo FROM personal';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener nombres de personal:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json(results);
    }
  });
});

// Endpoint para agregar un nuevo reporte de emergencia con formato numero_parte
app.post('/partesemergencias', async (req, res) => {
  const {
    nombre_denunciante,
    apellido_denunciante,
    documento_denunciante,
    direccion,
    tipo_asistencia,
    jefe_dotacion,
    parte_escrito,
    fecha
  } = req.body;

  try {
    // Obtener el siguiente numero para numero_parte con el formato numero/AñoActual
    const [rows] = await db.promise().query(`
      SELECT IFNULL(MAX(CAST(SUBSTRING_INDEX(numero_parte, '/', 1) AS UNSIGNED)), 0) + 1 AS next_parte 
      FROM partes
      WHERE numero_parte LIKE CONCAT('%/', YEAR(CURDATE()))
    `);

    const nextParte = rows[0]?.next_parte || 1;
    const numeroParte = `${nextParte}/${new Date().getFullYear()}`; // Formato numero/AñoActual

    // Insertar el nuevo reporte con numero_parte en formato especificado
    const [result] = await db.promise().query(`
      INSERT INTO partes (
        nombre_denunciante,
        apellido_denunciante,
        documento_denunciante,
        direccion,
        tipo_asistencia,
        jefe_dotacion,
        parte_escrito,
        fecha,
        numero_parte
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nombre_denunciante,
      apellido_denunciante,
      documento_denunciante,
      direccion,
      tipo_asistencia,
      jefe_dotacion,
      parte_escrito,
      fecha,
      numeroParte
    ]);

    res.json({ success: 'Reporte agregado correctamente', reportId: result.insertId, numeroParte });
  } catch (error) {
    console.error('Error al agregar el reporte:', error);
    res.status(500).json({ error: 'Error en el servidor al agregar el reporte' });
  }
});

// Endpoint para eliminar un reporte de emergencia usando numero_parte
app.delete('/partesemergencias/:id', (req, res) => {
  const { id } = req.params;
  console.log("ID recibido para eliminar:", id); // Log para verificar el ID recibido
  const query = 'DELETE FROM partes WHERE id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar el reporte en la base de datos:', err);
      res.status(500).json({ error: 'Error en el servidor al eliminar el reporte' });
    } else if (result.affectedRows === 0) {
      console.warn("No se encontró ningún reporte con ese ID.");
      res.status(404).json({ error: 'Reporte no encontrado' });
    } else {
      console.log("Reporte eliminado correctamente.");
      res.json({ success: 'Reporte eliminado correctamente' });
    }
  });
});


// Endpoint para obtener la lista de personal con el nombre de la jerarquía
app.get('/personal', (req, res) => {
  const query = `
    SELECT 
      p.legajo,
      CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo,
      p.documento,
      DATE_FORMAT(p.nacimiento, '%d-%m-%Y') AS nacimiento,  -- Formato de fecha DD-MM-AAAA
      DATE_FORMAT(p.fecha_ingreso, '%d-%m-%Y') AS fecha_ingreso,  -- Formato de fecha DD-MM-AAAA
      j.jerarquia AS jerarquia
    FROM personal p
    LEFT JOIN jerarquias j ON p.jerarquia_id = j.id
    ORDER BY p.legajo ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener datos de personal:', err);
      res.status(500).json({ error: 'Error en el servidor al obtener datos de personal' });
    } else {
      res.json(results);
    }
  });
});

// Endpoint para obtener la lista de jerarquías
app.get('/jerarquias', (req, res) => {
  const query = `
    SELECT id, jerarquia
    FROM jerarquias
    ORDER BY jerarquia ASC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener jerarquías:', err);
      res.status(500).json({ error: 'Error en el servidor al obtener jerarquías' });
    } else {
      res.json(results);
    }
  });
});



// Endpoint para agregar un nuevo personal y crear su login
app.post('/personal', (req, res) => {
  const { legajo, nombre, apellido, documento, nacimiento, fecha_ingreso, jerarquia_id } = req.body;

  // Query para insertar en la tabla `personal`
  const personalQuery = `
    INSERT INTO personal (legajo, nombre, apellido, documento, nacimiento, fecha_ingreso, jerarquia_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(personalQuery, [legajo, nombre, apellido, documento, nacimiento, fecha_ingreso, jerarquia_id], (err, result) => {
    if (err) {
      console.error('Error al agregar personal:', err);
      res.status(500).json({ error: 'Error en el servidor al agregar personal' });
      return;
    }

    // Query para insertar en la tabla `login` usando el `legajo` y `documento` como contraseña
    const loginQuery = `
      INSERT INTO login (legajo, contraseña)
      VALUES (?, ?)
    `;

    db.query(loginQuery, [legajo, documento], (err) => {
      if (err) {
        console.error('Error al crear login:', err);
        res.status(500).json({ error: 'Error en el servidor al crear login' });
        return;
      }

      res.json({ success: 'Personal y login creados correctamente' });
    });
  });
});

// Endpoint para eliminar personal por legajo
app.delete('/personal/:legajo', (req, res) => {
  const { legajo } = req.params;

  const query = `DELETE FROM personal WHERE legajo = ?`;

  db.query(query, [legajo], (err, result) => {
    if (err) {
      console.error('Error al eliminar personal:', err);
      res.status(500).json({ error: 'Error en el servidor al eliminar personal' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Personal no encontrado' });
    } else {
      res.json({ success: 'Personal eliminado correctamente' });
    }
  });
});


app.post('/login', (req, res) => {
  const { legajo, password } = req.body;
  const query = 'SELECT * FROM login WHERE legajo = ? AND contraseña = ?';
  
  db.query(query, [legajo, password], (err, results) => {
    if (err) {
      console.error('Error en el servidor al intentar iniciar sesión:', err);
      res.status(500).json({ success: false, error: 'Error en el servidor' });
    } else if (results.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, error: 'Legajo o contraseña incorrectos' });
    }
  });
});


const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor API en http://localhost:${PORT}`);
});