import React, { useEffect, useMemo } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PaperProvider, Button } from "react-native-paper";

import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

// Pantallas Auth
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import ClinicsDirectory from "./src/screens/public/ClinicsDirectory";

// Navegadores
import ClientTabs from "./src/navigation/ClientTabs";
import AdminTabs from "./src/navigation/AdminTabs"; // ✅ IMPORTANTE

const Stack = createNativeStackNavigator();

// --- PLACEHOLDERS ---
const AdminPlaceholder = () => {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Panel Administrativo (En construcción) 🏗️</Text>
      <Text style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
        Estás viendo esto porque tu usuario es Admin/SuperAdmin o no tiene rol reconocido.
      </Text>
      <Button mode="contained" onPress={logout} buttonColor="red">
        Cerrar Sesión y Salir
      </Button>
    </View>
  );
};

const VetPlaceholder = () => {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Agenda Veterinaria (En construcción) 🩺</Text>
      <Button mode="contained" onPress={logout} buttonColor="red">
        Cerrar Sesión
      </Button>
    </View>
  );
};
// --------------------

function AppContent() {
  const { user, loading, loadToken } = useAuth();
  const { setUserKey } = useTheme();

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    setUserKey(user?.email || "guest");
  }, [user]);

  // ✅ Resolver rol de forma robusta
  const role = useMemo(() => {
    // si normalizaste role en AuthContext
    if (user?.role) return user.role;

    // si viene de Spatie
    if (user?.roles?.length) return user.roles[0]?.name;

    return null;
  }, [user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E8F5E8" }}>
        <ActivityIndicator size="large" color="#2E8B57" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // 🌍 FLUJO PÚBLICO
        <>
          <Stack.Screen name="ClinicsDirectory" component={ClinicsDirectory} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        // 🔐 FLUJO PRIVADO: SIEMPRE 1 SCREEN (para no quedar vacío)
        <>
          {/** ✅ SUPERADMIN / ADMIN */}
          {(role === "superadmin" || role === "admin" || role === "super_admin" || role === "clinic_admin") && (
            <Stack.Screen name="AdminDashboard" component={AdminTabs} />
          )}

          {/** ✅ VETERINARIO */}
          {(role === "veterinario" || role === "veterinarian") && (
            <Stack.Screen name="VetDashboard" component={VetPlaceholder} />
          )}

          {/** ✅ CLIENTE */}
          {(role === "cliente" || role === "client") && (
            <Stack.Screen name="ClientDashboard" component={ClientTabs} />
          )}

          {/** ✅ FALLBACK: si el rol no coincide con nada */}
          {!role && <Stack.Screen name="UnknownRole" component={AdminPlaceholder} />}

          {role &&
            role !== "superadmin" &&
            role !== "admin" &&
            role !== "super_admin" &&
            role !== "clinic_admin" &&
            role !== "veterinario" &&
            role !== "veterinarian" &&
            role !== "cliente" &&
            role !== "client" && (
              <Stack.Screen name="UnknownRole2" component={AdminPlaceholder} />
            )}
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <PaperProvider>
        <AuthProvider>
          <NavigationContainer>
            <AppContent />
          </NavigationContainer>
        </AuthProvider>
      </PaperProvider>
    </ThemeProvider>
  );
}
