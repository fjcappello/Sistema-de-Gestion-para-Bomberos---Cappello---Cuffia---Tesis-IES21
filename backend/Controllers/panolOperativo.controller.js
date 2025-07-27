const db = require("../DB/db.js");
const path = require("path");
const fs = require("fs");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

//Recuperar las herramientas del pañol segun filtros
const recuperarElementos = function recuperarElementos(req, res) {
  const tipo = req.query.tipo || null;
  const fincorp = req.query.fincorp || null;
  const fvenc = req.query.fvenc || null;
  const estado = req.query.estado || null;
  const texto = req.query.texto || null;

  let query = `SELECT 
                    p.id_elemento, 
                    p.elemento, 
                    t.tipo, 
                    m.marca, 
                    DATE_FORMAT(p.f_incorporacion, '%Y-%m-%d') AS f_incorporacion, 
                    DATE_FORMAT(p.f_vencimiento, '%Y-%m-%d') AS f_vencimiento, 
                    l.asignacion, 
                    DATE_FORMAT(p.f_asignacion, '%Y-%m-%d') AS f_asignacion, 
                    e.estado, 
                    p.foto
                FROM 
                    panol AS p
                INNER JOIN 
                    tipo_elemento AS t ON p.id_tipo = t.id_tipo
                INNER JOIN 
                    marca_elemento AS m ON p.id_marca = m.id_marca
                INNER JOIN 
                    lugar_asignacion AS l ON l.id_asignacion = p.id_asignacion
                INNER JOIN 
                    estado_elemento AS e ON p.id_estado = e.id_estado
                WHERE 1 + 1 = 2 ORDER BY id_elemento DESC
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
  const query = `SELECT * FROM tipo_elemento`;
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
  const query = `SELECT * FROM estado_elemento`;
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
  const query = `SELECT * FROM marca_elemento`;
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

// Recuperar asignaciones de lugar
const recuperarAsignaciones = function recuperarAsignaciones(req, res) {
  const query = `SELECT * FROM lugar_asignacion`;
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
    elemento,
    id_tipo,
    id_marca,
    f_incorporacion,
    f_vencimiento,
    id_asignacion,
    f_asignacion,
    id_estado,
  } = req.body;
  const query = `INSERT INTO panol (
                        elemento, 
                        id_tipo, 
                        id_marca, 
                        f_incorporacion, 
                        f_vencimiento, 
                        id_asignacion, 
                        f_asignacion, 
                        id_estado
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
    return res.status(400).json({
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
      return res.status(400).json({
        message: "No se pudo agregar correctamente el nuevo elemento.",
      });
    }
    if (req.query.usuario_id) {
      registrarLog(
        req.query.usuario_id,
        `Agregó un nuevo elemento al pañol: ${elemento}`
      );
    }
    return res.status(200).json({
      message: "Elemento agregado correctamente",
      id_insertado: results.insertId,
    });
  });
};

// Editar un elemento del pañol
const editarElemento = (req, res) => {
  const { id_elemento, id_asignacion, f_asignacion, id_estado } = req.body;
  if (!id_elemento || !id_asignacion || !id_estado) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }
  let query = `UPDATE panol SET id_asignacion = ?, f_asignacion = ?, id_estado = ?`;
  const parametros = [id_asignacion, f_asignacion, id_estado];
  // Si hay imagen cargada Y el estado es 3 (BAJA), se agrega foto
  if (req.file && parseInt(id_estado) === 3) {
    const foto = cargaDeFoto(req.file);
    query += `, foto = ?`;
    parametros.push(foto);
  }
  query += ` WHERE id_elemento = ?`;
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
    if (req.query.usuario_id) {
      registrarLog(
        req.query.usuario_id,
        `Editó el elemento del pañol ID ${id_elemento}`
      );
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
