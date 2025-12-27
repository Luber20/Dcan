import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

const API_URL = "http://192.168.18.10:8000/api";
  // Tu IP local

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await axios.get(`${API_URL}/me`);
        // La respuesta de /me es { user: { ... }, clinic_id: ... }
        setUser(response.data);
      }
    } catch (error) {
      console.log("No hay token válido o error en /me:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user, clinic_id } = response.data;  // ← Aquí estaba el error: "user", no "user: userData"
      await SecureStore.setItemAsync("authToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser({ ...user, clinic_id });  // ← Guardamos el objeto user completo + clinic_id
      return { success: true };
    } catch (error) {
      console.log("Error en login:", error);
      const message = error.response?.data?.message || error.message || "Credenciales incorrectas";
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`);
    } catch (error) {
      console.log("Error en logout:", error.message);
    }
    await SecureStore.deleteItemAsync("authToken");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, loadToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;