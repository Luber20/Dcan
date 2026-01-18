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

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }));
  };

  // ✅ INTERCEPTOR: Si el backend dice "401 Unauthenticated", nos salimos a la fuerza.
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async (error) => {
        if (error.response?.status === 401) {
          console.log("⚠️ Sesión expirada (401). Cerrando sesión...");
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
        setToken(storedToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        
        try {
            const response = await axios.get(`${API_URL}/me`);
            if (response.data.user) {
                setUser({ ...response.data.user, clinic_id: response.data.clinic_id });
            } else {
                setUser(response.data);
            }
        } catch (e) {
            // Si falla /me, es probable que el token no sirva.
            console.log("Error validando token:", e.message);
            await logout(); 
        }
      }
    } catch (error) {
       await logout();
    } finally {
      setLoading(false);
    }
  };

  const setSessionData = async (token, userData, clinic_id) => {
    if(!token) return;
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
    try { await axios.post(`${API_URL}/logout`); } catch (e) {}
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null); // Esto fuerza a App.js a cambiar a Pantalla Pública
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, registerAction, updateUser, loading, loadToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;