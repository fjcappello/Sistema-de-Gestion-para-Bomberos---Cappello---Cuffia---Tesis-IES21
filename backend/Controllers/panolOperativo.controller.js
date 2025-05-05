const db = require('../DB/db.js');


//Recuperar las herramientas del pañol segun filtros
const recuperarHerramientas = function recuperarHerramientas(req, res) {
    const {tipo, fincorp, fvenc, estado, texto} = req.body;
    
    let query = `SELECT p.id_herramienta, p.herramienta, t.tipo, m.marca, p.f_incorporacion, p.f_vencimiento, l.asignacion, p.f_asignacion, e.estado, p.foto
                FROM panol AS p INNER JOIN
                tipo_herramienta AS t ON p.id_tipo = t.id_tipo
                INNER JOIN marca_herramienta AS m ON p.id_marca = m.id_marca
                INNER JOIN lugar_asignacion AS l ON l.id_asignacion = p.id_asignacion
                INNER JOIN estado_herramienta AS e ON p.id_estado = e.id_estado
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
        query += ` AND (p.id_herramienta LIKE ? OR p.herramienta LIKE ?)`
        const e = `%${texto}%`;
        parametros.push(e, e);
    }

    db.query(query, parametros ,(error, results) => {
        if (error) {
            console.error('Error al recuperar las herramientas del pañol:', error);
            return res.status(500).json({ error: 'Error al recuperar las herrameintas del pañol' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron herramientas.' });
        }
        return res.status(200).json(results);
    });
};

//Recuperar los tipos de herramientas
const recuperarTipos = function recuperarTipos(req, res) {
    const query = `SELECT * FROM tipo_herramienta`;
    db.query(query, parametros ,(error, results) => {
        if (error) {
            console.error('Error al recuperar los tipos de herramienta:', error);
            return res.status(500).json({ error: 'Error al recuperar los tipos de herramienta' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron tipos de herramientas.' });
        }
        return res.status(200).json(results);
    });
};

//Recuperar los estados de las herramientas
const recuperarEstados = function recuperarEstados(req, res) {
    const query = `SELECT * FROM tipo_herramienta`;
    db.query(query, parametros ,(error, results) => {
        if (error) {
            console.error('Error al recuperar los tipos de herramienta:', error);
            return res.status(500).json({ error: 'Error al recuperar los tipos de herramienta' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontraron tipos de herramientas.' });
        }
        return res.status(200).json(results);
    });
};

//Cambiar estado de una herramienta
const cambiarEstados = function cambiarEstados(req, res) {
    let flag = false
    const {id_estado, id_herramienta} = req.body;
    const query = `UPDATE panol VALUE id_estado = ? WHERE id_herramienta = ?`;
    if (!id_estado || !id_herramienta) {
        return res.status(400).json({ error: 'Faltan datos: id_estado o id_herramienta' });
    }
    if(flag){
        db.query(query, parametros ,(error, results) => {
            if (error) {
                console.error('Error al intentar cambiar el estado:', error);
                return res.status(500).json({ error: 'Error al intentar cambiar el estado' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ message: 'No se encontraron tipos de herramientas.' });
            }
            return res.status(200).json(results);
        });
    }
    return res.status(401).json({succes: false, message: "Debe ingresar una foto del elemento destruido antes de darlo de baja"});
};

//Agregar foto para poder dar de baja
const agregarFoto = function agregarFoto(req, res) {
    let bandera = false;
    const query = `UPDATE panol VALUE foto = ? WHERE id_herramienta = ?`;
    const {url, id_herramienta} = req.body;
    const parametros = [url, id_herramienta];
    
    if(!parametros || !id_herramienta){
        return res.status(400).json({succes: false, message: "Faltan datos importantes: id_herramienta o url de la imagen"});
    }
   
    //Aqui va el proceso de cargar la imagen y el cambio de estado de la bandera

    if(bandera){
        db.query(query, parametros ,(error, results) => {
            if (error) {
                console.error('Error al recuperar los tipos de herramienta:', error);
                return res.status(500).json({ error: 'Error al recuperar los tipos de herramienta' });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No se encontraron tipos de herramientas.' });
            }
            return res.status(200).json(results);
        });
    }
    return res.status().json({succes: false, message: "No se completó la subida de la foto de la herramienta/equipo destruido."})
};


//Funcion de cargar la foto foto
const cargaDeFoto = function cargaDeFoto(){
    
}


module.exports = {
    recuperarHerramientas,
    recuperarTipos,
    recuperarEstados,
    cambiarEstados,
    agregarFoto
};
