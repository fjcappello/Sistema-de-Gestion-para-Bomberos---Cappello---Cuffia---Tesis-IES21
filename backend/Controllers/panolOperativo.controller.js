const db = require("../DB/db.js");
const path = require("path");
const fs = require("fs");
const { registrarLog } = require("../Middlewares/logSeguridadLogger.js");

const recuperarElementos = async function recuperarElementos(req, res) {
  const { tipo, fincorp, fvenc, estado, texto } = req.body;

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
                WHERE 1 + 1 = 2 ORDER BY id_elemento ASC
            `;
  try {
    const results = await db.query(query);
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "No se encontraron elementos." });
    }
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error al recuperar los elementos del pañol:", error);
    return res.status(500).json({ success: false, error: "Error al recuperar los elementos del pañol" });
  }
};

const recuperarTipos = async function recuperarTipos(req, res) {
  const query = `SELECT * FROM tipo_elemento`;
  try {
    const results = await db.query(query);
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "No se encontraron tipos de elementos." });
    }
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error al recuperar los tipos de elemento:", error);
    return res.status(500).json({ success: false, error: "Error al recuperar los tipos de elemento" });
  }
};

const recuperarEstados = async function recuperarEstados(req, res) {
  const query = `SELECT * FROM estado_elemento`;
  try {
    const results = await db.query(query);
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "No se encontraron estados de elementos." });
    }
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error al recuperar los tipos de elemento:", error);
    return res.status(500).json({ success: false, error: "Error al recuperar los estados de elemento" });
  }
};

const recuperarMarcas = async function recuperarMarcas(req, res) {
  const query = `SELECT * FROM marca_elemento`;
  try {
    const results = await db.query(query);
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "No se encontraron marcas de elementos." });
    }
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error al recuperar las marcas de elementos:", error);
    return res.status(500).json({ success: false, error: "Error al recuperar las marcas de elemento" });
  }
};

const recuperarAsignaciones = async function recuperarAsignaciones(req, res) {
  const query = `SELECT * FROM lugar_asignacion`;
  try {
    const results = await db.query(query);
    if (results.length === 0) {
      return res.status(404).json({ success: false, error: "No se encontraron marcas de elementos." });
    }
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error("Error al recuperar las marcas de elementos:", error);
    return res.status(500).json({ success: false, error: "Error al recuperar las marcas de elemento" });
  }
};

const agregarElemento = async function agregarElemento(req, res) {
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
  if (
    !elemento ||
    !id_tipo ||
    !id_marca ||
    !f_incorporacion ||
    !id_asignacion ||
    !id_estado
  ) {
    return res.status(400).json({ success: false, error: "Faltan datos: elemento, id_tipo, id_marca, f_incorporacion, id_asignacion o id_estado" });
  }
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
  try {
    const results = await db.query(query, parametros);
    if (results.affectedRows === 0) {
      return res.status(400).json({ success: false, message: "No se pudo agregar correctamente el nuevo elemento." });
    }
    if (req.query.usuario_id) {
      registrarLog(req.query.usuario_id, `Agregó un nuevo elemento al pañol: ${elemento}`);
    }
    return res.status(200).json({
      success: true,
      message: "Elemento agregado correctamente",
      id_insertado: results.insertId,
    });
  } catch (error) {
    console.error("Error al intentar crear un elemento:", error);
    return res.status(500).json({ success: false, error: "Error al intentar crear un elemento" });
  }
};

const editarElemento = async (req, res) => {
  const { id_elemento, id_asignacion, f_asignacion, id_estado } = req.body;
  if (!id_elemento || !id_asignacion || !id_estado) {
    return res.status(400).json({ success: false, error: "Faltan datos requeridos" });
  }
  let query = `UPDATE panol SET id_asignacion = ?, f_asignacion = ?, id_estado = ?`;
  const parametros = [id_asignacion, f_asignacion, id_estado];
  if (req.file && parseInt(id_estado) === 3) {
    const foto = cargaDeFoto(req.file);
    query += `, foto = ?`;
    parametros.push(foto);
  }
  query += ` WHERE id_elemento = ?`;
  parametros.push(id_elemento);
  try {
    const results = await db.query(query, parametros);
    if (results.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Elemento no encontrado" });
    }
    if (req.query.usuario_id) {
      registrarLog(req.query.usuario_id, `Editó el elemento del pañol ID ${id_elemento}`);
    }
    return res.status(200).json({ success: true, message: "Elemento actualizado correctamente" });
  } catch (error) {
    console.error("Error al editar el elemento:", error);
    return res.status(500).json({ success: false, error: "Error en la edición del elemento" });
  }
};

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
