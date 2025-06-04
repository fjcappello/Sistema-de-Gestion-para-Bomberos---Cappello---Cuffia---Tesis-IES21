import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Styles/OtrasCuentas.css";

function OtrasCuentas() {
  const [usuarios, setUsuarios] = useState([]);
  const [seleccionado, setSeleccionado] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [permisoSeleccionado, setPermisoSeleccionado] = useState("");
  const [permisos, setPermisos] = useState([]);

  const [mensajePermiso, setMensajePermiso] = useState("");
  const [mensajePassword, setMensajePassword] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3001/usuarios")
      .then((res) => setUsuarios(res.data))
      .catch((error) => console.error("Error cargando usuarios:", error));
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3001/permisos")
      .then((res) => setPermisos(res.data))
      .catch((error) => console.error("Error cargando permisos:", error));
  }, []);

  useEffect(() => {
    if (seleccionado) {
      const usuario = usuarios.find(
        (u) => u.legajo.toString() === seleccionado
      );
      if (usuario) {
        setNombreUsuario(usuario.nombre || "");
        setPermisoSeleccionado(usuario.id_rol?.toString() || "");
      }
    } else {
      setNombreUsuario("");
      setPermisoSeleccionado("");
    }
  }, [seleccionado, usuarios]);

  const manejarRestablecerPassword = () => {
    axios
      .put("http://localhost:3001/restablecer-cuenta", { legajo: seleccionado })
      .then(() => {
        setMensajePassword("✅ Contraseña restablecida correctamente.");
        setTimeout(() => setMensajePassword(""), 3000);
      })
      .catch((error) =>
        console.error("Error restableciendo contraseña:", error)
      );
  };

  const manejarActualizarPermiso = () => {
    axios
      .put("http://localhost:3001/cambiar-permisos", {
        legajo: seleccionado,
        id_rol: permisoSeleccionado,
      })
      .then(() => {
        setMensajePermiso("✅ Permiso actualizado correctamente.");
        setTimeout(() => setMensajePermiso(""), 3000);

        axios
          .get("http://localhost:3001/usuarios")
          .then((res) => setUsuarios(res.data))
          .catch((error) => console.error("Error recargando usuarios:", error));
      })
      .catch((error) => console.error("Error actualizando permiso:", error));
  };

  return (
    <div className="configuracion-layout">
      <div className="configuracion-contenido">
        <h2>Otras Cuentas</h2>

        {/* Usuario */}
        <div className="configuracion-filtros">
          <h3>Usuario</h3>
          <div className="usuario-row">
            <select
              className="configuracion-input"
              value={seleccionado}
              onChange={(e) => setSeleccionado(e.target.value)}
            >
              <option value="">-- Selecciona Usuario --</option>
              {usuarios.map((usuario) => (
                <option key={usuario.legajo} value={usuario.legajo.toString()}>
                  {usuario.legajo + " - " + usuario.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Permisos */}
        <div className="configuracion-filtros">
          <h3>Permisos</h3>
          <div className="permisos-row">
            <select
              className="configuracion-input"
              value={permisoSeleccionado}
              onChange={(e) => setPermisoSeleccionado(e.target.value)}
            >
              <option value="">-- Selecciona Permiso --</option>
              {permisos.map((permiso) => (
                <option key={permiso?.id_rol} value={permiso?.id_rol?.toString() || ""}>
                  {permiso.rol}
                </option>
              ))}
            </select>
            <button
              className="configuracion-boton"
              onClick={manejarActualizarPermiso}
            >
              Actualizar Permisos
            </button>
          </div>
          {mensajePermiso && <p className="mensaje-exito">{mensajePermiso}</p>}
        </div>

        {/* Restablecer Contraseña */}
        <div className="configuracion-filtros">
          <h3>Reestablecer contraseña</h3>
          <p>
            Presione el botón para restablecer la contraseña del usuario a su
            estado original.
          </p>
          <button
            className="configuracion-boton"
            onClick={manejarRestablecerPassword}
          >
            Restablecer Contraseña
          </button>
          {mensajePassword && (
            <p className="mensaje-exito">{mensajePassword}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OtrasCuentas;
