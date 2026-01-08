import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userKey, setUserKey] = useState("guest"); // cambia según el usuario logueado

  const storageKey = `theme:${userKey}`;

  // Cargar preferencia cuando cambia el usuario
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(storageKey);
        if (saved !== null) setIsDarkMode(saved === "1");
        else setIsDarkMode(false); // si no existe, por defecto claro
      } catch {
        // si falla lectura, no rompe la app
      }
    })();
  }, [storageKey]);

  // Guardar preferencia cuando cambia el tema
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(storageKey, isDarkMode ? "1" : "0");
      } catch {
        // si falla guardado, no rompe la app
      }
    })();
  }, [isDarkMode, storageKey]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const theme = useMemo(
    () => ({
      isDarkMode,
      colors: isDarkMode
        ? {
            background: "#121212",
            card: "#1E1E1E",
            text: "#FFFFFF",
            subtitle: "#CCCCCC",
            primary: "#2E8B57",
          }
        : {
            background: "#E8F5E8",
            card: "#FFFFFF",
            text: "#1E1E1E",
            subtitle: "#666666",
            primary: "#2E8B57",
          },
    }),
    [isDarkMode]
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setUserKey }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
