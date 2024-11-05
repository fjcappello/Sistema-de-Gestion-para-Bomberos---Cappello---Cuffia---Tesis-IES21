const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Configuración de la conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bd_sigb',
  port: 3004,
});

db.connect((err) => {
  if (err) console.error('Error de conexión a MySQL:', err);
  else console.log('Conectado a MySQL');
});

// Obtener lista de partes de emergencias
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

// Obtener lista de jefes de dotación
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

// Agregar un nuevo reporte de emergencia con formato numero_parte
app.post('/partesemergencias', async (req, res) => {
  const {
    nombre_denunciante,
    apellido_denunciante,
    documento_denunciante,
    direccion,
    tipo_asistencia,
    jefe_dotacion,
    parte_escrito,
    fecha,
  } = req.body;

  try {
    const [rows] = await db.promise().query(`
      SELECT IFNULL(MAX(CAST(SUBSTRING_INDEX(numero_parte, '/', 1) AS UNSIGNED)), 0) + 1 AS next_parte 
      FROM partes
      WHERE numero_parte LIKE CONCAT('%/', YEAR(CURDATE()))
    `);

    const nextParte = rows[0]?.next_parte || 1;
    const numeroParte = `${nextParte}/${new Date().getFullYear()}`;

    const [result] = await db.promise().query(
      `
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
    `,
      [
        nombre_denunciante,
        apellido_denunciante,
        documento_denunciante,
        direccion,
        tipo_asistencia,
        jefe_dotacion,
        parte_escrito,
        fecha,
        numeroParte,
      ]
    );

    res.json({ success: 'Reporte agregado correctamente', reportId: result.insertId, numeroParte });
  } catch (error) {
    console.error('Error al agregar el reporte:', error);
    res.status(500).json({ error: 'Error en el servidor al agregar el reporte' });
  }
});

// Eliminar un reporte de emergencia usando id
app.delete('/partesemergencias/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM partes WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar el reporte en la base de datos:', err);
      res.status(500).json({ error: 'Error en el servidor al eliminar el reporte' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Reporte no encontrado' });
    } else {
      res.json({ success: 'Reporte eliminado correctamente' });
    }
  });
});

// Obtener lista de personal completo con jerarquía
app.get('/personal', (req, res) => {
  const query = `
    SELECT 
      p.legajo,
      CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo,
      p.documento,
      DATE_FORMAT(p.nacimiento, '%d-%m-%Y') AS nacimiento,
      DATE_FORMAT(p.fecha_ingreso, '%d-%m-%Y') AS fecha_ingreso,
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

// Obtener lista de jerarquías
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

// Agregar nuevo personal y crear login
app.post('/personal', (req, res) => {
  const { legajo, nombre, apellido, documento, nacimiento, fecha_ingreso, jerarquia_id } = req.body;

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

// Eliminar personal por legajo
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

// Endpoint de login básico
app.post('/login', (req, res) => {
  const { legajo, password } = req.body;
  const query = `
    SELECT CONCAT(nombre, ' ', apellido) AS nombre_completo 
    FROM personal 
    WHERE legajo = ? 
    AND EXISTS (SELECT 1 FROM login WHERE legajo = ? AND contraseña = ?)
  `;
  
  db.query(query, [legajo, legajo, password], (err, results) => {
    if (err) {
      console.error('Error en el servidor al intentar iniciar sesión:', err);
      res.status(500).json({ success: false, error: 'Error en el servidor' });
    } else if (results.length > 0) {
      const nombreCompleto = results[0].nombre_completo;
      res.json({ success: true, nombreCompleto });
    } else {
      res.json({ success: false, error: 'Legajo o contraseña incorrectos' });
    }
  });
});

// Endpoint para obtener un parte de emergencia por ID o número de parte
app.get('/partesemergencias/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      p.id AS parte_id,
      p.numero_parte,
      p.nombre_denunciante,
      p.apellido_denunciante,
      p.documento_denunciante,
      p.direccion,
      p.tipo_asistencia,
      DATE_FORMAT(p.fecha, '%d-%m-%Y') AS fecha,
      CONCAT(per.nombre, ' ', per.apellido) AS jefe_dotacion,
      p.parte_escrito
    FROM partes p
    LEFT JOIN personal per ON p.jefe_dotacion = per.legajo
    WHERE p.id = ? OR p.numero_parte = ?
  `;
  
  db.query(query, [id, id], (err, results) => {
    if (err) {
      console.error('Error al obtener el parte:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else if (results.length === 0) {
      res.status(404).json(null); // Enviar null si no se encuentra
    } else {
      res.json(results[0]);
    }
  });
});

// Endpoint para obtener reportes filtrados
app.get('/reportes', (req, res) => {
  const { jefeDotacion, tipoAsistencia, startDate, endDate } = req.query;

  let query = `
    SELECT tipo_asistencia, COUNT(*) AS cantidad 
    FROM partes 
    WHERE 1=1
  `;

  const params = [];
  if (jefeDotacion) {
    query += ` AND jefe_dotacion = ?`;
    params.push(jefeDotacion);
  }
  if (tipoAsistencia) {
    query += ` AND tipo_asistencia = ?`;
    params.push(tipoAsistencia);
  }
  if (startDate) {
    query += ` AND fecha >= ?`;
    params.push(startDate);
  }
  if (endDate) {
    query += ` AND fecha <= ?`;
    params.push(endDate);
  }
  query += ` GROUP BY tipo_asistencia`;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Error al obtener reportes:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json(results);
    }
  });
});

// Iniciar el servidor en el puerto 3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor API en http://localhost:${PORT}`);
});