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

  const loadToken = async () => {
    setLoading(true);
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (storedToken) {
        setToken(storedToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        const response = await axios.get(`${API_URL}/me`);
        if (response.data && response.data.email) {
            setUser(response.data); 
        }
      }
    } catch (error) {
      if (error.response?.status === 401) await clearSession();
    } finally {
      setLoading(false);
    }
  };

  const clearSession = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    setToken(null);
  };

  // Función para procesar datos tras Login o Registro exitoso
  const setSessionData = async (token, userData, clinic_id) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setToken(token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUser({ ...userData, clinic_id });
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user, clinic_id } = response.data;
      await setSessionData(token, user, clinic_id);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Error al iniciar sesión" };
    }
  };

  // ✨ NUEVA FUNCIÓN: Para inicio de sesión automático tras registrarse
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
    try { await axios.post(`${API_URL}/logout`); } catch (e) {}
    await clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, registerAction, loading, loadToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;