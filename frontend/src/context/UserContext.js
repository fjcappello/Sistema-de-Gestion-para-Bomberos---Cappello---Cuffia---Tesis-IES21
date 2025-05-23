import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const usuarioGuardado = localStorage.getItem("usuario");
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });
  const [token, setTokenState] = useState(null);

  // Effect to update window.jwtToken when token state changes
  useEffect(() => {
    window.jwtToken = token;
  }, [token]);

  const setAuthData = (userData, userToken) => {
    setUsuario(userData);
    setTokenState(userToken);
    // localStorage for usuario and isAuthenticated is still managed here as per existing logic
    if (userData) {
      localStorage.setItem('usuario', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      // This case might not be hit if logout is separate, but good for completeness
      localStorage.removeItem('usuario');
      localStorage.removeItem('isAuthenticated');
    }
  };

  const logout = () => {
    setUsuario(null);
    setTokenState(null);
    // window.jwtToken will be set to null by the useEffect hook above
    localStorage.removeItem('usuario');
    localStorage.removeItem('isAuthenticated');
    // No need to remove 'token' from localStorage as it's not set there anymore
  };
  
  // Initial sync if there's a token (e.g. if we were to re-add localStorage token persistence for the token itself)
  // For now, this isn't strictly necessary as token is only set on login via setAuthData.
  // useEffect(() => {
  //   const storedToken = localStorage.getItem('token'); // Example if we were to use it
  //   if (storedToken) {
  //     setTokenState(storedToken);
  //   }
  // }, []);


  return (
    <UserContext.Provider value={{ usuario, token, setAuthData, logout, setUsuario /* keep setUsuario if used elsewhere directly */ }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsuario() {
  return useContext(UserContext);
}
