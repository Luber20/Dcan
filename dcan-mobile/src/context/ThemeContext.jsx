import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
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
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
