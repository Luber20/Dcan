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

const Stack = createNativeStackNavigator();

// --- PLACEHOLDERS ---
const AdminPlaceholder = () => {
  const { logout } = useAuth();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Panel (Rol no reconocido) 🧩</Text>
      <Text style={{ textAlign: "center", color: "#666", marginBottom: 20 }}>
        Tu usuario inició sesión, pero el rol no está configurado para mostrar una interfaz.
      </Text>
      <Button mode="contained" onPress={logout} buttonColor="red">
        Cerrar Sesión
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

function AppContent() {
  const { user, loading, loadToken } = useAuth();
  const { setUserKey } = useTheme();

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    setUserKey(user?.email || "guest");
  }, [user]);

  // ✅ Resolver rol de forma robusta (compat: user.role o Spatie roles[0].name)
  const role = useMemo(() => {
    if (user?.role) return user.role;
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
        // 🔐 FLUJO PRIVADO (SIEMPRE al menos 1 SCREEN)
        <>
          {/* ✅ SUPER ADMIN (tu UI nueva) */}
          {(role === "superadmin" || role === "super_admin") && (
            <Stack.Screen name="SuperAdminDashboard" component={SuperAdminTabs} />
          )}

          {/* ✅ ADMIN DE CLÍNICA (conserva lo que ya está en main) */}
          {(role === "clinic_admin" || role === "admin") && (
            <Stack.Screen name="AdminDashboard" component={AdminTabs} />
          )}
          
          {/* Veterinario */}
          {user.roles?.[0]?.name === "veterinarian" && (
             <Stack.Screen name="VetDashboard" component={VetPlaceholder} />
          )}
          
          {/* Otros (Super Admin o sin rol) */}
          {(!user.roles?.[0] || user.roles[0].name === "super_admin") && (
             <Stack.Screen name="SuperAdmin" component={AdminPlaceholder} />
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
