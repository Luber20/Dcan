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

  const isLoggingOut = useRef(false);

  const ensureDefaultClientRole = (userData) => {
    if (!userData) return userData;

    const rolesRaw = userData.roles;
    const roles = Array.isArray(rolesRaw) ? rolesRaw : [];

    const hasRoles =
      roles.length > 0 &&
      roles.some((r) => {
        if (typeof r === "string") return r.trim().length > 0;
        return !!r?.name;
      });

    if (hasRoles) return userData;

    return { ...userData, roles: [{ name: "client" }] };
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && !isLoggingOut.current) {
          console.log("⚠️ Sesión expirada (401). Cerrando sesión ordenadamente...");
          isLoggingOut.current = true;
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
          const rawUser = response.data.user || response.data;
          setUser(ensureDefaultClientRole(rawUser));
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
    if (!newToken) return;
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      setToken(newToken);

      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      const normalizedUser = ensureDefaultClientRole({ ...userData, clinic_id });
      setUser(normalizedUser);

      isLoggingOut.current = false;
    } catch (e) {
      console.log("Error guardando sesión:", e);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, user, clinic_id } = response.data;

      await setSessionData(token, user, clinic_id);

      const normalizedUser = ensureDefaultClientRole({ ...user, clinic_id });
      return { success: true, user: normalizedUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Error al iniciar sesión",
      };
    }
  };

  const registerAction = async (regData) => {
    try {
      const endpoint = regData?.clinic_id ? "register-client" : "register";

      // ✅ DEBUG (no rompe): ver a qué endpoint vas y qué mandas
      console.log("REGISTER ENDPOINT:", endpoint);
      console.log("REGDATA:", regData);

      const response = await axios.post(`${API_URL}/${endpoint}`, regData);
      const data = response.data || {};

      const respToken =
        data.token ||
        data.access_token ||
        data.data?.token ||
        data.data?.access_token ||
        null;

      const respUser =
        data.user ||
        data.data?.user ||
        null;

      const respClinicId =
        data.clinic_id ??
        data.clinicId ??
        respUser?.clinic_id ??
        null;

      if (!respToken || !respUser) {
        console.log("⚠️ Respuesta de registro inesperada:", data);
        return {
          success: false,
          message:
            "El servidor no devolvió token/usuario en el formato esperado. Revisa la respuesta del endpoint de registro.",
          errors: data.errors,
        };
      }

      await setSessionData(respToken, respUser, respClinicId);

      const normalizedUser = ensureDefaultClientRole({ ...respUser, clinic_id: respClinicId });
      return { success: true, user: normalizedUser };
    } catch (error) {
      console.log("REGISTER ERROR:", error.response?.data || error.message);
      return {
        success: false,
        errors: error.response?.data?.errors,
        // ✅ message SIEMPRE (para que el RegisterScreen muestre alert)
        message: error.response?.data?.message || error.message || "No se pudo registrar.",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`);
    } catch (e) {}

    await SecureStore.deleteItemAsync(TOKEN_KEY);
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
    isLoggingOut.current = false;
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ensureDefaultClientRole({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, registerAction, updateUser, loading, loadToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
