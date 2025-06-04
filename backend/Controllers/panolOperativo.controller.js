const db = require("../DB/db.js");
const path = require("path");
const fs = require("fs");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

//Recuperar las herramientas del pañol segun filtros
const recuperarElementos = function recuperarElementos(req, res) {
  const { tipo, fincorp, fvenc, estado, texto } = req.body;

  let query = `SELECT 
                    p.id AS id_elemento,
                    p.elemento_nombre AS elemento,
                    t.tipo, 
                    m.marca, 
                    DATE_FORMAT(p.fecha_incorporacion, '%Y-%m-%d') AS f_incorporacion,
                    DATE_FORMAT(p.fecha_vencimiento, '%Y-%m-%d') AS f_vencimiento,
                    l.asignacion, 
                    DATE_FORMAT(p.fecha_asignacion, '%Y-%m-%d') AS f_asignacion,
                    e.estado, 
                    p.foto_path AS foto
                FROM 
                    panol_elementos AS p
                INNER JOIN 
                    tipos_elemento_panol AS t ON p.tipo_elemento_id = t.id
                INNER JOIN 
                    marcas_elemento_panol AS m ON p.marca_elemento_id = m.id
                INNER JOIN 
                    lugares_asignacion_panol AS l ON p.lugar_asignacion_id = l.id
                INNER JOIN 
                    estados_elemento_panol AS e ON p.estado_elemento_id = e.id
                WHERE 1 + 1 = 2 ORDER BY p.id ASC
            `;

  db.query(query, (error, results) => {
    if (error) {
      console.error("Error al recuperar los elementos del pañol:", error);
      return res
        .status(500)
        .json({ error: "Error al recuperar los elementos del pañol" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "No se encontraron elementos." });
    }
    return res.status(200).json(results);
  });
};

//Recuperar los tipos de herramientas
const recuperarTipos = function recuperarTipos(req, res) {
  const query = `SELECT id AS id_tipo, tipo FROM tipos_elemento_panol`;
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error al recuperar los tipos de elemento:", error);
      return res
        .status(500)
        .json({ error: "Error al recuperar los tipos de elemento" });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron tipos de elementos." });
    }
    return res.status(200).json(results);
  });
};

//Recuperar los estados de las herramientas
const recuperarEstados = function recuperarEstados(req, res) {
  const query = `SELECT id AS id_estado, estado FROM estados_elemento_panol`;
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error al recuperar los tipos de elemento:", error);
      return res
        .status(500)
        .json({ error: "Error al recuperar los estados de elemento" });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron estados de elementos." });
    }
    return res.status(200).json(results);
  });
};

//Recuperar los tipos de herramientas
const recuperarMarcas = function recuperarMarcas(req, res) {
  const query = `SELECT id AS id_marca, marca FROM marcas_elemento_panol`;
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error al recuperar las marcas de elementos:", error);
      return res
        .status(500)
        .json({ error: "Error al recuperar las marcas de elemento" });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron marcas de elementos." });
    }
    return res.status(200).json(results);
  });
};

const recuperarAsignaciones = function recuperarAsignaciones(req, res) {
  const query = `SELECT id AS id_asignacion, asignacion FROM lugares_asignacion_panol`;
  db.query(query, (error, results) => {
    if (error) {
      console.error("Error al recuperar las marcas de elementos:", error);
      return res
        .status(500)
        .json({ error: "Error al recuperar las marcas de elemento" });
    }
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron marcas de elementos." });
    }
    return res.status(200).json(results);
  });
};

//Agregar una nuevo elemento de pañol
const agregarElemento = function agregarElemento(req, res) {
  let {
    elemento, // maps to elemento_nombre
    id_tipo, // maps to tipo_elemento_id
    id_marca, // maps to marca_elemento_id
    f_incorporacion, // maps to fecha_incorporacion
    f_vencimiento, // maps to fecha_vencimiento
    id_asignacion, // maps to lugar_asignacion_id
    f_asignacion, // maps to fecha_asignacion
    id_estado, // maps to estado_elemento_id
  } = req.body;
  const query = `INSERT INTO panol_elementos (
                        elemento_nombre,
                        tipo_elemento_id,
                        marca_elemento_id,
                        fecha_incorporacion,
                        fecha_vencimiento,
                        lugar_asignacion_id,
                        fecha_asignacion,
                        estado_elemento_id
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  //Verificaciond e datos
  if (
    !elemento ||
    !id_tipo ||
    !id_marca ||
    !f_incorporacion ||
    !id_asignacion ||
    !id_estado
  ) {
    return res
      .status(400)
      .json({
        error:
          "Faltan datos: elemento, id_tipo, id_marca, f_incorporacion, id_asignacion o id_estado",
      });
  }
  //Verificacion y control de campos opcionales
  f_vencimiento = f_vencimiento || null;
  f_asignacion = f_asignacion || null;

  const parametros = [
    elemento,
    id_tipo,
    id_marca,
    f_incorporacion,
    f_vencimiento,
    id_asignacion,
    f_asignacion,
    id_estado,
  ];
  db.query(query, parametros, (error, results) => {
    if (error) {
      console.error("Error al intentar crear un elemento:", error);
      return res
        .status(500)
        .json({ error: "Error al intentar crear un elemento" });
    }
    if (results.affectedRows === 0) {
      return res
        .status(400)
        .json({
          message: "No se pudo agregar correctamente el nuevo elemento.",
        });
    }
    if (req.query.legajo_usuario) {
      registrarLog(req.query.legajo_usuario, `Agregó un nuevo elemento al pañol: ${elemento}`);
    }
    return res.status(200).json({
      message: "Elemento agregado correctamente",
      id_insertado: results.insertId,
    });
  });
};

// Editar un elemento del pañol
const editarElemento = (req, res) => {
  const { id_elemento, id_asignacion, f_asignacion, id_estado } = req.body; // id_elemento maps to id
  if (!id_elemento || !id_asignacion || !id_estado) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }
  let query = `UPDATE panol_elementos SET lugar_asignacion_id = ?, fecha_asignacion = ?, estado_elemento_id = ?`;
  const parametros = [id_asignacion, f_asignacion, id_estado];
  // Si hay imagen cargada Y el estado es 3 (BAJA), se agrega foto
  if (req.file && parseInt(id_estado) === 3) {
    const foto = cargaDeFoto(req.file);
    query += `, foto_path = ?`;
    parametros.push(foto);
  }
  query += ` WHERE id = ?`;
  parametros.push(id_elemento);
  db.query(query, parametros, (error, results) => {
    if (error) {
      console.error("Error al editar el elemento:", error);
      return res
        .status(500)
        .json({ error: "Error en la edición del elemento" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Elemento no encontrado" });
    }
    if (req.query.legajo_usuario) {
      registrarLog(req.query.legajo_usuario, `Editó el elemento del pañol ID ${id_elemento}`);
    }
    return res
      .status(200)
      .json({ message: "Elemento actualizado correctamente" });
  });
};

// Función para cargar la foto y obtener la direccion
const cargaDeFoto = function cargaDeFoto(archivo) {
  const uniqueName = `${Date.now()}-${archivo.originalname}`;
  const nuevoCamino = path.join(__dirname, "..", "..", "resources", uniqueName);
  fs.renameSync(archivo.path, nuevoCamino);
  return `resources/${uniqueName}`;
};

module.exports = {
  recuperarElementos,
  recuperarTipos,
  recuperarEstados,
  recuperarMarcas,
  agregarElemento,
  recuperarAsignaciones,
  editarElemento,
};
