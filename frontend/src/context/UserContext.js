import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = sessionStorage.getItem("usuario");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });

  const guardarUsuario = (usuario) => {
    if (usuario) {
      sessionStorage.setItem("usuario", JSON.stringify(usuario));
    } else {
      sessionStorage.removeItem("usuario");
    }
    setUsuario(usuario);
  };

  const limpiarUsuario = () => {
    sessionStorage.removeItem("usuario");
    setUsuario(null);
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      limpiarUsuario();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <UserContext.Provider value={{ usuario, setUsuario: guardarUsuario, limpiarUsuario }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsuario() {
  return useContext(UserContext);
}