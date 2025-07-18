import React, { useState, useEffect } from "react";
import axios from "axios";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import PersonalTable from "./components/Personal";
import EmergenciesTable from "./components/EmergenciesTable";
import Login from "./components/Login";
import "./components/Styles/App.css";
import ReportsPage from "./components/EstadisticasEmergencias";
import EstadisticaAsistencia from "./components/estadisticasAsistencias";
import BandejaEntrada from "./components/BandejaEntrada";
import EnviarMensajeModal from "./components/EnviarMensajeModal";
import ModalCambioPassword from "./components/ModalCambioPassword";
import Configuracion from "./components/Configuracion";
import Auditoria from "./components/Auditoria";
import MiCuenta from "./components/MiCuenta";
import OtrasCuentas from "./components/OtrasCuentas";
import { useUsuario } from "./context/UserContext";
import MovimientosPersonas from "./components/MovimientosPersonas";
import MovilesRegistro from "./components/MovilesRegistro";
import Dashboard from "./components/Dashboard/Dashboard";
import MovimientoMoviles from "./components/MovimientoMoviles";
import PanolOperativo from "./components/PanolOperativo";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { usuario, setUsuario } = useUsuario();
  const [horaActual, setHoraActual] = useState(new Date());

  useEffect(() => {
    const storedAuth = sessionStorage.getItem("isAuthenticated");
    const storedUsuario = sessionStorage.getItem("usuario");

    if (storedAuth === "true" && storedUsuario) {
      setIsAuthenticated(true);
      const usuarioParseado = JSON.parse(storedUsuario);
      setUsuario({
        legajo: usuarioParseado.legajo,
        nombre: usuarioParseado.nombre,
        apellido: usuarioParseado.apellido,
        primerIngreso: usuarioParseado.primerIngreso,
        nombreCompleto: `${usuarioParseado.nombre} ${usuarioParseado.apellido}`,
      });
    } else {
      setIsAuthenticated(false);
      setUsuario(null);
    }
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActual(new Date());
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  // Control de sesión multi-pestaña: logout solo cuando todas las pestañas cierran
  useEffect(() => {
    const tabId = Math.random().toString(36).substring(2);
    const bc = new BroadcastChannel("sigb_channel");
    sessionStorage.setItem("sigb_tab_id", tabId);
    localStorage.setItem(`sigb_tab_${tabId}`, Date.now().toString());

    const marcarActiva = () => {
      localStorage.setItem(`sigb_tab_${tabId}`, Date.now().toString());
    };

    const intervalo = setInterval(marcarActiva, 2000);

    bc.onmessage = (event) => {
      if (event.data === "logout") {
        handleLogout();
      }
    };

    const cleanup = () => {
      localStorage.removeItem(`sigb_tab_${tabId}`);
      const ahora = Date.now();
      const activos = Object.keys(localStorage)
        .filter((k) => k.startsWith("sigb_tab_"))
        .map((k) => parseInt(localStorage.getItem(k)))
        .filter((ts) => ahora - ts < 5000);
      if (activos.length <= 1) {
        bc.postMessage("logout");
      }
    };

    window.addEventListener("beforeunload", cleanup);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener("beforeunload", cleanup);
      cleanup();
      bc.close();
    };
  }, []);

  const handleLogout = async () => {
    const usuarioActual = JSON.parse(sessionStorage.getItem("usuario"));

    if (usuarioActual) {
      try {
        await axios.post("http://localhost:3001/logout", {
          legajo: usuarioActual.legajo,
          nombreCompleto: usuarioActual.nombreCompleto,
        });
      } catch (error) {}
    }

    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("usuario");
    setUsuario(null);
    setIsAuthenticated(false);
  };

  return (
    // Configuración del enrutamiento y el estado de autenticación, en caso de primer ingreso se muestra el modal para cambiar la contraseña
    <Router>
      <div className="App">
        {usuario?.primerIngreso && (
          <ModalCambioPassword
            legajo={usuario.legajo}
            onPasswordChanged={() => {
              const usuarioActualizado = {
                ...usuario,
                primerIngreso: false,
                nombreCompleto: `${usuario.nombre} ${usuario.apellido}`,
              };
              setUsuario(usuarioActualizado);
              sessionStorage.setItem(
                "usuario",
                JSON.stringify(usuarioActualizado)
              );
            }}
          />
        )}
        {isAuthenticated && <Navbar onLogout={handleLogout} />}

        <main>
          <Routes>
            {!isAuthenticated ? (
              <Route
                path="/"
                element={<Login setIsAuthenticated={setIsAuthenticated} />}
              />
            ) : (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/emergencias" element={<EmergenciesTable />} />
                <Route path="/personal" element={<PersonalTable />} />
                <Route
                  path="/reportes/estadisticas"
                  element={<ReportsPage />}
                />
                <Route
                  path="/estadisticas-asistencia"
                  element={<EstadisticaAsistencia />}
                />
                <Route
                  path="/reportes/movimientos-personas"
                  element={<MovimientosPersonas />}
                />
                <Route
                  path="/reportes/movimientos-moviles"
                  element={<MovimientoMoviles />}
                />
                <Route path="/bandeja-entrada" element={<BandejaEntrada />} />
                <Route path="/configuracion" element={<Configuracion />} />
                <Route path="/moviles" element={<MovilesRegistro />} />
                <Route path="/mi-cuenta" element={<MiCuenta />} />
                <Route path="/auditoria" element={<Auditoria />} />
                <Route path="/otras-cuentas" element={<OtrasCuentas />} />
                <Route path="/panol-operativo" element={<PanolOperativo />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
