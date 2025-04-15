import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Styles/Configuracion.css';

function Configuracion() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const [nueva, setNueva] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pestañaActiva, setPestañaActiva] = useState('password');
  const [bitacora, setBitacora] = useState([]);
  const [filtros, setFiltros] = useState({ usuario_id: '', accion: '', desde: '', hasta: '' });
  const [pagina, setPagina] = useState(1);
  const registrosPorPagina = 5;

  const cambiarPassword = async () => {
    if (nueva !== confirmar) {
      setError('Las contraseñas no coinciden.');
      setMensaje('');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/cambiar-password', {
        legajo: usuario.legajo,
        nuevaPassword: nueva
      });

      if (response.data.success) {
        setMensaje('Contraseña actualizada con éxito.');
        setError('');
        setNueva('');
        setConfirmar('');
      } else {
        setError(response.data.error || 'No se pudo actualizar la contraseña.');
        setMensaje('');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
      setMensaje('');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const fetchBitacora = async () => {
    try {
      const params = {};
      if (filtros.usuario_id) params.usuario_id = filtros.usuario_id;
      if (filtros.accion) params.accion = filtros.accion;
      if (filtros.desde) params.desde = filtros.desde;
      if (filtros.hasta) params.hasta = filtros.hasta;

      const response = await axios.get('http://localhost:3001/obtenerBitacora', { params });
      setBitacora(response.data);
    } catch (err) {
      console.error('Error al obtener bitácora:', err);
    }
  };

  useEffect(() => {
    if (pestañaActiva === 'bitacora') {
      fetchBitacora();
    }
  }, [pestañaActiva, filtros]);

  useEffect(() => {
    if (pestañaActiva === 'bitacora') {
      const intervalId = setInterval(fetchBitacora, 5000); // cada 5 segundos
      return () => clearInterval(intervalId);
    }
  }, [pestañaActiva]);

  const inicio = (pagina - 1) * registrosPorPagina;
  const fin = inicio + registrosPorPagina;
  const registrosPaginados = bitacora.slice(inicio, fin);

  return (
    <div className="configuracion-layout">
      <main className="configuracion-contenido">
        <div className="configuracion-selector">
          <div
            className={`menu-item ${pestañaActiva === 'password' ? 'activo' : ''}`}
            onClick={() => setPestañaActiva('password')}
          >
            Cambiar contraseña
          </div>
          <div
            className={`menu-item ${pestañaActiva === 'bitacora' ? 'activo' : ''}`}
            onClick={() => setPestañaActiva('bitacora')}
          >
            Bitácora
          </div>
        </div>

        {pestañaActiva === 'password' && (
          <>
            <h2>Cambiar contraseña</h2>
            <div className="configuracion-filtros">
              <input
                className="input-campo"
                type={showPassword ? "text" : "password"}
                placeholder="Nueva contraseña"
                value={nueva}
                onChange={(e) => setNueva(e.target.value)}
              />
              <input
                className="input-campo"
                type={showPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={confirmar}
                onChange={(e) => setConfirmar(e.target.value)}
              />
              <button type="button" className="nuevo-mensaje-btn" onClick={togglePasswordVisibility}>
                {showPassword ? '🙈' : '👁️'}
              </button>
              <button className="nuevo-mensaje-btn" onClick={cambiarPassword}>
                Guardar
              </button>
            </div>
            {mensaje && <p className="mensaje-ok">{mensaje}</p>}
            {error && <p className="mensaje-error">{error}</p>}
          </>
        )}

        {pestañaActiva === 'bitacora' && (
          <>
            <h2>Historial de acciones</h2>
            <div className="configuracion-filtros">
              <input
                type="text"
                placeholder="Legajo"
                value={filtros.usuario_id}
                onChange={(e) => setFiltros({ ...filtros, usuario_id: e.target.value })}
              />
              <input
                type="text"
                placeholder="Acción"
                value={filtros.accion}
                onChange={(e) => setFiltros({ ...filtros, accion: e.target.value })}
              />
              <input
                type="date"
                value={filtros.desde}
                onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
              />
              <input
                type="date"
                value={filtros.hasta}
                onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
              />
              <button className="nuevo-mensaje-btn" onClick={fetchBitacora}>Filtrar</button>
              <button className="nuevo-mensaje-btn" onClick={() => {
                import('xlsx').then(xlsx => {
                  const datos = bitacora.map(({ id, usuario_id, usuario, fecha, accion }) => {
                    return {
                      'Fecha y Hora': fecha,
                      'Legajo': usuario_id,
                      'Personal': usuario || '',
                      'Acción': accion
                    };
                  });

                  const ahora = new Date();
                  const formatoFecha = ahora.toLocaleDateString('es-AR').replace(/\//g, '-');
                  const formatoHora = ahora.toLocaleTimeString('es-AR', { hour12: false }).replace(/:/g, '-');

                  const worksheet = xlsx.utils.json_to_sheet(datos);
                  const workbook = xlsx.utils.book_new();
                  xlsx.utils.book_append_sheet(workbook, worksheet, 'Bitacora');
                  xlsx.writeFile(workbook, `bitacora_${formatoFecha}_${formatoHora}.xlsx`);
                });
              }}>Exportar Excel</button>
            </div>
            <table className="configuracion-tabla">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {registrosPaginados.map((item) => (
                  <tr key={item.id}>
                    <td>{item.usuario || item.usuario_id}</td>
                    <td>{item.accion}</td>
                    <td>{item.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="paginacion">
              <button onClick={() => setPagina(p => Math.max(p - 1, 1))} disabled={pagina === 1}>Anterior</button>
              <span>Página {pagina}</span>
              <button onClick={() => setPagina(p => (p * registrosPorPagina < bitacora.length ? p + 1 : p))} disabled={pagina * registrosPorPagina >= bitacora.length}>Siguiente</button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Configuracion;
