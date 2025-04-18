const db = require('../DB/db.js');

// Obtener todos los móviles
const getMoviles = (req, res) => {
  const query = `
    SELECT m.id, m.interno, m.marca, m.modelo, m.dominio, m.vin, m.kilometraje, m.fecha_service,
           me.nombre_estado AS estado
    FROM moviles m
    JOIN moviles_estados me ON m.estado_id = me.id
    ORDER BY m.interno;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener móviles:', err);
      res.status(500).json({ error: 'Error del servidor' });
    } else {
      res.json(results);
    }
  });
};

// Agregar un móvil
const addMovil = (req, res) => {
  const { interno, marca, modelo, dominio, vin, kilometraje, fecha_service, estado_id } = req.body;
  const query = `
    INSERT INTO moviles (interno, marca, modelo, dominio, vin, kilometraje, fecha_service, estado_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [interno, marca, modelo, dominio, vin, kilometraje, fecha_service, estado_id];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al agregar móvil:', err);
      res.status(500).json({ error: 'Error al agregar móvil' });
    } else {
      res.json({ success: 'Móvil agregado correctamente', id: result.insertId });
    }
  });
};

// Actualizar un móvil
const updateMovil = (req, res) => {
  const { interno } = req.params;
  const { marca, modelo, dominio, vin, kilometraje, fecha_service, estado_id } = req.body;


  const query = `
    UPDATE moviles
    SET marca = ?, modelo = ?, dominio = ?, vin = ?, kilometraje = ?, fecha_service = ?, estado_id = ?
    WHERE interno = ? AND estado_id IN (1, 2)
  `;

  const values = [marca, modelo, dominio, vin, kilometraje, fecha_service, estado_id, interno];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al actualizar móvil:', err);
      res.status(500).json({ error: 'Error al actualizar móvil' });
    } else if (result.affectedRows === 0) {
      res.status(400).json({ error: 'No se pudo actualizar. El móvil podría no existir o estar dado de baja.' });
    } else {
      res.json({ success: 'Móvil actualizado correctamente' });
    }
  });
};

module.exports = {
  getMoviles,
  addMovil,
  updateMovil
};