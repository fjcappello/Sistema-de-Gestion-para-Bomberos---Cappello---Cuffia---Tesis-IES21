import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Styles/OtrasCuentas.css'; // 👈 Asegúrate de importar el CSS aquí

function OtrasCuentas() {
  const [usuarios, setUsuarios] = useState([]);
  const [seleccionado, setSeleccionado] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [permisoSeleccionado, setPermisoSeleccionado] = useState('');
  const [permisos, setPermisos] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(error => console.error('Error cargando usuarios:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3001/api/permisos')
      .then(res => setPermisos(res.data))
      .catch(error => console.error('Error cargando permisos:', error));
  }, []);

  useEffect(() => {
    if (seleccionado) {
      const usuario = usuarios.find(u => u.legajo === seleccionado);
      if (usuario) {
        setNombreUsuario(usuario.nombre || '');

        setPermisoSeleccionado(usuario.id_rol || '');
      }
    } else {
      setNombreUsuario('');
      
      setPermisoSeleccionado('');
    }
  }, [seleccionado, usuarios]);

  const manejarRestablecerPassword = () => {
    axios.post('http://localhost:3001/', { legajo: seleccionado })
      .then(res => alert('Contraseña restablecida correctamente'))
      .catch(error => console.error('Error restableciendo contraseña:', error));
  };

  const manejarActualizarPermiso = () => {
    axios.put('http://localhost:3001/', { 
      legajo: seleccionado, 
      permiso: permisoSeleccionado 
    })
      .then(res => alert('Permiso actualizado correctamente'))
      .catch(error => console.error('Error actualizando permiso:', error));
  };

  return (
    <div className="configuracion-layout">
      <div className="configuracion-contenido">
        <h2>Otras Cuentas</h2>
        {/* Selección de Usuario */}
        <div className="configuracion-filtros">
          <h3>Uauario</h3>
          <select 
            className="configuracion-input"
            value={seleccionado} 
            onChange={(e) => setSeleccionado(Number(e.target.value))}
          >
            <option value="">-- Selecciona Usuario --</option>
            {usuarios.map((usuario) => (
              <option key={usuario.legajo} value={usuario.legajo}>
                {usuario.legajo}
              </option>
            ))}
          </select>
          <input 
            className="configuracion-input"
            type="text" 
            value={nombreUsuario} 
            disabled 
            placeholder="Nombre del usuario" 
          />
        </div>
        {/* Restablecer Contraseña */}
        <div className="configuracion-filtros">
          <h3>Reestablecer contraseña</h3>
          <button className="configuracion-boton" onClick={manejarRestablecerPassword}>
            Restablecer Contraseña
          </button>
        </div>
        {/* Permisos */}
        <div className="configuracion-filtros">
          <h3>Permisos</h3>
          <select 
            className="configuracion-input"
            value={permisoSeleccionado} 
            onChange={(e) => setPermisoSeleccionado(Number(e.target.value))}
          >
            <option value="">-- Selecciona Permiso --</option>
            {permisos.map((permiso) => (
              <option key={permiso.id} value={permiso.id}>
                {permiso.nombre}
              </option>
            ))}
          </select>
          <button className="configuracion-boton" onClick={manejarActualizarPermiso}>
            Actualizar Permiso
          </button>
        </div>
      </div>
    </div>
  );
}

export default OtrasCuentas;
