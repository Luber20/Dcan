import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://192.168.18.10:8000/api";

  useEffect(() => {
    loadToken();
  }, []);

  const clearSession = async () => {
    await SecureStore.deleteItemAsync("authToken");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  const loadToken = async () => {
    try {
      const token = await SecureStore.getItemAsync("authToken");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await axios.get(`${API_URL}/me`);
        setUser(response.data);
      }
    } catch (error) {
      // ✅ Si /me falla, el token probablemente es inválido/expiró → limpiamos sesión
      console.log("No hay token válido o error en /me:", error.message);
      await clearSession();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });

      const { token, user, clinic_id } = response.data;

      await SecureStore.setItemAsync("authToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser({ ...user, clinic_id });

      return { success: true };
    } catch (error) {
      // ✅ 1) Si NO hay response => es red/servidor/timeout, NO credenciales
      if (!error.response) {
        console.log("Error de red en login:", error.message);
        return {
          success: false,
          message: "Error de red: no se puede conectar al servidor. Intenta nuevamente.",
        };
      }

      // ✅ 2) Si es 401 => credenciales incorrectas (y limpiamos token por seguridad)
      if (error.response.status === 401) {
        await clearSession();
        return { success: false, message: "Credenciales incorrectas." };
      }

      // ✅ 3) Otros errores (422 validación, 500 server, etc.)
      const message =
        error.response?.data?.message ||
        "No se pudo iniciar sesión. Intenta nuevamente.";

      console.log("Error en login:", error.response?.status, error.response?.data);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`);
    } catch (error) {
      console.log("Error en logout:", error.message);
    }
    await clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, loadToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
