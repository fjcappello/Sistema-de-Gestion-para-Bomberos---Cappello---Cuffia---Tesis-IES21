import React from "react";
import ReactDOM from "react-dom";
import axios from 'axios';
import "./components/Styles/index.css";
import App from "./App";
import { UserProvider } from "./context/UserContext";

// Axios request interceptor
axios.interceptors.request.use(
  config => {
    const token = window.jwtToken; // Read token from global variable
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

ReactDOM.render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
