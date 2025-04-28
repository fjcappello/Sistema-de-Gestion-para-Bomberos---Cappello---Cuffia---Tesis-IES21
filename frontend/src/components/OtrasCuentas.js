import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OtrasCuentas() {
  const [usuarios, setUsuarios] = useState([]);
  const [seleccionado, setSeleccionado] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [estadoCuenta, setEstadoCuenta] = useState('');
  const [permisoSeleccionado, setPermisoSeleccionado] = useState('');
  const [permisos, setPermisos] = useState([]);

  // Cargar usuarios al iniciar
  useEffect(() => {
    axios.get('http://localhost:3001/usuarios')
      .then(res => setUsuarios(res.data))
      .catch(error => console.error('Error cargando usuarios:', error));
  }, []);

  // Cargar permisos al iniciar
  useEffect(() => {
    axios.get('http://localhost:3001/api/permisos')
      .then(res => setPermisos(res.data))
      .catch(error => console.error('Error cargando permisos:', error));
  }, []);

  // Actualizar datos cada vez que cambia el usuario seleccionado
  useEffect(() => {
    if (seleccionado) {
      // Buscar el usuario en la lista
      const usuario = usuarios.find(u => u.legajo === seleccionado);
      if (usuario) {
        setNombreUsuario(usuario.nombre || '');  // Actualiza el nombre del usuario
        setEstadoCuenta(usuario.situacion_id || '');    // Actualiza el estado de la cuenta
        setPermisoSeleccionado(usuario.id_rol || '');  // Actualiza el permiso de la cuenta
      }
    } else {
      // Si no hay usuario seleccionado, limpia los campos
      setNombreUsuario('');
      setEstadoCuenta('');
      setPermisoSeleccionado('');
    }
  }, [seleccionado, usuarios]);  // Se ejecuta cada vez que cambia el `legajo`

  const manejarRestablecerPassword = () => {
    axios.post('http://localhost:3001/', { legajo: seleccionado })
      .then(res => alert('Contraseña restablecida correctamente'))
      .catch(error => console.error('Error restableciendo contraseña:', error));
  };

  const manejarActualizarEstado = () => {
    axios.put(`http://localhost:3001/`, { 
      legajo: seleccionado, 
      estado: estadoCuenta 
    })
      .then(res => alert('Estado actualizado correctamente'))
      .catch(error => console.error('Error actualizando estado:', error));
  };

  const manejarActualizarPermiso = () => {
    axios.put(`http://localhost:3001/`, { 
      legajo: seleccionado, 
      permiso: permisoSeleccionado 
    })
      .then(res => alert('Permiso actualizado correctamente'))
      .catch(error => console.error('Error actualizando permiso:', error));
  };

  return (
    <>
      <h2>Otras Cuentas</h2>
      <div>
        {/* Sección Selección de Usuario */}
        <div className=''>
          <h3>Seleccionar usuario</h3>
            <select value={seleccionado} onChange={(e) => {setSeleccionado(Number(e.target.value));}}>
            <option value="">-- Selecciona --</option>
            {usuarios.map((usuario) => (
              <option key={usuario.legajo} value={usuario.legajo}>
                {usuario.legajo}
              </option>
            ))}
          </select>
          <input type="text" value={nombreUsuario} disabled placeholder="Nombre del usuario" />
        </div>

        {/* Sección Restablecer Contraseña */}
        <div className=''>
          <h3>Restablecer contraseña</h3>
          <button onClick={manejarRestablecerPassword}>Restablecer</button>
        </div>

        {/* Sección Estado de Cuenta */}
        <div className=''>
          <h3>Estado de cuenta</h3>
          <select value={estadoCuenta} onChange={(e) => setEstadoCuenta(e.target.value)}>
            <option value="1">Activo</option>
            <option value="4">Inactivo</option>
          </select>
          <button onClick={manejarActualizarEstado}>Actualizar Estado</button>
        </div>

        {/* Sección Permisos */}
        <div className=''>
          <h3>Asignación de permisos</h3>
          <select value={permisoSeleccionado} onChange={(e) => setSeleccionado(Number(e.target.value))}>
            <option value="">-- Selecciona Permiso --</option>
            {permisos.map((permiso) => (
              <option key={permiso.id} value={permiso.id}>
                {permiso.nombre}
              </option>
            ))}
          </select>
          <button onClick={manejarActualizarPermiso}>Actualizar Permiso</button>
        </div>
      </div>
    </>
  );
}

export default OtrasCuentas;
