const db = require('../DB/db.js');

// Obtener todos los móviles
const getMoviles = (req, res) => {
  const query = `
    SELECT m.id, m.interno, m.marca, m.modelo, m.dominio, m.vin, m.kilometraje, m.fecha_service,
           m.estado_id, me.nombre_estado AS estado
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

// Obtener todos los estados de móviles
const getEstadosMoviles = (req, res) => {
  const query = 'SELECT id, nombre_estado AS nombre FROM moviles_estados';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error al obtener estados de móviles:', err);
      res.status(500).json({ error: 'Error al obtener estados' });
    } else {
      res.json(results);
    }
  });
};

// Editar campos específicos de un móvil
const editMovil = (req, res) => {
  const { id } = req.params;
  const campos = [];
  const valores = [];

  if (req.body.kilometraje !== undefined) {
    campos.push("kilometraje = ?");
    valores.push(req.body.kilometraje);
  }
  if (req.body.fecha_service !== undefined) {
    campos.push("fecha_service = ?");
    valores.push(req.body.fecha_service);
  }
  if (req.body.estado_id !== undefined) {
    campos.push("estado_id = ?");
    valores.push(req.body.estado_id);
  }

  if (campos.length === 0) {
    return res.status(400).json({ error: "No se especificaron campos a modificar" });
  }

  valores.push(id);
  const query = `UPDATE moviles SET ${campos.join(", ")} WHERE id = ?`;

  db.query(query, valores, (err, result) => {
    if (err) {
      console.error('Error al actualizar móvil:', err);
      res.status(500).json({ error: 'Error al actualizar móvil' });
    } else {
      res.json({ success: 'Móvil actualizado correctamente' });
    }
  });
};

module.exports = {
  getMoviles,
  addMovil,
  updateMovil,
  getEstadosMoviles,
  editMovil
};