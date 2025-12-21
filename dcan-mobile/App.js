import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/auth/LoginScreen";
import ClientTabs from "./src/navigation/ClientTabs";
import InicioScreen from "./src/screens/Inicio/Inicio"; 
import { View, ActivityIndicator } from "react-native";

const Stack = createNativeStackNavigator();

function AppContent() {
  const { loading, loadToken } = useAuth();

  useEffect(() => {
    loadToken();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#E8F5E8" }}>
        <ActivityIndicator size="large" color="#2E8B57" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* ✅ PRIMERA PANTALLA AL ABRIR */}
      <Stack.Screen name="Inicio" component={InicioScreen} />

      {/* (Opcional) Deja estas por si luego navegas a ellas */}
      <Stack.Screen name="Dashboard" component={ClientTabs} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
}
