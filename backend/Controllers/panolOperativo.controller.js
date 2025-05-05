const db = require('../DB/db.js');
const path = require('path');
const fs = require('fs');

//Recuperar las herramientas del pañol segun filtros
const recuperarElementos = function recuperarElementos(req, res) {
    const {tipo, fincorp, fvenc, estado, texto} = req.body;
    
    let query = `SELECT p.id_elemento, p.elemento, t.tipo, m.marca, p.f_incorporacion, p.f_vencimiento, l.asignacion, p.f_asignacion, e.estado, p.foto
                FROM panol AS p INNER JOIN
                tipo_elemento AS t ON p.id_tipo = t.id_tipo
                INNER JOIN marca_elemento AS m ON p.id_marca = m.id_marca
                INNER JOIN lugar_asignacion AS l ON l.id_asignacion = p.id_asignacion
                INNER JOIN estado_elemento AS e ON p.id_estado = e.id_estado
                WHERE 1=1`;

    let parametros = [];

    if(tipo){
        query += ` AND p.id_tipo = ? `
        parametros.push(tipo);
    }
    if(fincorp){
        query += ` AND p.f_incorporacion = ?`
        parametros.push(fincorp);
    }
    if(fvenc){
        query += ` AND p.f_vencimiento = ? `
        parametros.push(fvenc);
    }
    if(estado){
        query += ` AND p.id_estado = ? `
        parametros.push(estado);
    }
    if(texto){
        query += ` AND (p.id_elemento LIKE ? OR p.elemento LIKE ?)`
        const e = `%${texto}%`;
        parametros.push(e, e);
    }

    db.query(query, parametros ,(error, results) => {
        if (error) {
            console.error('Error al recuperar los elementos del pañol:', error);
            return res.status(500).json({ error: 'Error al recuperar los elementos del pañol' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron elementos.' });
        }
        return res.status(200).json(results);
    });
};

//Recuperar los tipos de herramientas
const recuperarTipos = function recuperarTipos(req, res) {
    const query = `SELECT * FROM tipo_elemento`;
    db.query(query, parametros ,(error, results) => {
        if (error) {
            console.error('Error al recuperar los tipos de elemento:', error);
            return res.status(500).json({ error: 'Error al recuperar los tipos de elemento' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron tipos de elementos.' });
        }
        return res.status(200).json(results);
    });
};

//Recuperar los estados de las herramientas
const recuperarEstados = function recuperarEstados(req, res) {
    const query = `SELECT * FROM tipo_elemento`;
    db.query(query, parametros ,(error, results) => {
        if (error) {
            console.error('Error al recuperar los tipos de elemento:', error);
            return res.status(500).json({ error: 'Error al recuperar los tipos de elemento' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron tipos de elementos.' });
        }
        return res.status(200).json(results);
    });
};

//Cambiar estado de una herramienta
const cambiarEstados = function cambiarEstados(req, res) {
    const foto = cargaDeFoto(req.file);
    const {id_estado, id_elemento} = req.body;
    const query = `UPDATE panol SET id_estado = ?, foto = ? WHERE id_elemento = ?`;
    if (!id_estado || !id_elemento) {
        return res.status(400).json({ error: 'Faltan datos: id_estado o id_elemento' });
    }
    if(!foto){
        return res.status(400).json({ error: 'Faltan datos: Debe cargar la foto del elemento dado de baja' });
    }
    const parametros = [id_estado, foto, id_elemento];
    db.query(query, parametros ,(error, results) => {
        if (error) {
            console.error('Error al intentar cambiar el estado:', error);
            return res.status(500).json({ error: 'Error al intentar cambiar el estado' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'No se encontraron tipos de elementos.' });
        }
        return res.status(200).json(results);
    });
};

// Función para cargar la foto y obtener la direccion
const cargaDeFoto = function cargaDeFoto(archivo) {
    const uniqueName = `${Date.now()}-${archivo.originalname}`;
    const nuevoCamino = path.join(__dirname, '..', '..', 'resources', uniqueName);
    fs.renameSync(archivo.path, nuevoCamino);
    return `resources/${uniqueName}`;
};


module.exports = {
    recuperarElementos,
    recuperarTipos,
    recuperarEstados,
    cambiarEstados,
};
