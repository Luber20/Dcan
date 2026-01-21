import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
  
  // Usamos una referencia para evitar bucles de logout
  const isLoggingOut = useRef(false);

  // ✅ INTERCEPTOR MEJORADO: Evita el bucle infinito
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async (error) => {
        // Si es 401 Y no nos estamos saliendo ya...
        if (error.response?.status === 401 && !isLoggingOut.current) {
          console.log("⚠️ Sesión expirada (401). Cerrando sesión ordenadamente...");
          isLoggingOut.current = true; // Bloqueamos futuros intentos
          await logout();
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    setLoading(true);
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (storedToken) {
        // Configuramos axios ANTES de llamar a la API
        setToken(storedToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        
        try {
            const response = await axios.get(`${API_URL}/me`);
            // Guardamos usuario completo
            setUser(response.data.user || response.data);
        } catch (e) {
            console.log("Token inválido al inicio:", e.message);
            await logout(); 
        }
      }
    } catch (error) {
       await logout();
    } finally {
       setLoading(false);
    }
  };

  const setSessionData = async (newToken, userData, clinic_id) => {
    if(!newToken) return;
    try {
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        setToken(newToken);
        
        // Actualizamos headers globales INMEDIATAMENTE
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        
        // Actualizamos estado de usuario
        setUser({ ...userData, clinic_id });
        isLoggingOut.current = false; // Reset flag
    } catch (e) {
        console.log("Error guardando sesión:", e);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user, clinic_id } = response.data;
      await setSessionData(token, user, clinic_id);
      return { success: true, user: { ...user, clinic_id } };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Error al iniciar sesión" };
    }
  };

  const registerAction = async (regData) => {
    try {
      const response = await axios.post(`${API_URL}/register-client`, regData);
      const { token, user, clinic_id } = response.data;
      await setSessionData(token, user, clinic_id);
      return { success: true };
    } catch (error) {
      return { success: false, errors: error.response?.data?.errors, message: error.response?.data?.message };
    }
  };

  const logout = async () => {
    try { 
        // Intentamos avisar al backend, pero si falla no importa
        await axios.post(`${API_URL}/logout`); 
    } catch (e) {}
    
    // Limpieza local
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
    isLoggingOut.current = false;
  };

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, registerAction, updateUser, loading, loadToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;