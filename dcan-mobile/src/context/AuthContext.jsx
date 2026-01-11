import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = "authToken"; 

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadToken();
  }, []);

  // Función para cargar el token al abrir la App
  const loadToken = async () => {
    setLoading(true);
    try {
      // 1. Buscamos en la memoria del celular
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      
      if (storedToken) {
        setToken(storedToken);
        // 2. Configuramos Axios
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        
        // 3. Verificamos con el servidor
        const response = await axios.get(`${API_URL}/me`);
        
        if (response.data && response.data.email) {
            setUser(response.data); 
        } else {
            setUser(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      // Si el token expiró (401), limpiamos la sesión
      if (error.response?.status === 401) {
        await clearSession();
      }
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
      setToken(null);
    } catch (error) {
      // Error silencioso al limpiar
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user, clinic_id } = response.data;

      await SecureStore.setItemAsync(TOKEN_KEY, token);
      setToken(token);
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser({ ...user, clinic_id });

      return { success: true };

    } catch (error) {
      if (!error.response) return { success: false, message: "Error de conexión." };
      if (error.response.status === 401) return { success: false, message: "Credenciales incorrectas." };
      return { success: false, message: "Error al iniciar sesión." };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`);
    } catch (error) {
      // Ignoramos error de red al salir
    }
    await clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, loadToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;