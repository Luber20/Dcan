import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PaperProvider } from "react-native-paper";

import { AuthProvider, useAuth } from "./src/context/AuthContext";

import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import ClientTabs from "./src/navigation/ClientTabs";
import ClinicsDirectory from "./src/screens/public/ClinicsDirectory";
// import InicioScreen from "./src/screens/Inicio/Inicio"; // (tu pantalla, si luego la quieres usar)

const Stack = createNativeStackNavigator();

function AppContent() {
  const { user, loading, loadToken } = useAuth(); // ✅ aquí faltaba user

  useEffect(() => {
    loadToken();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#E8F5E8",
        }}
      >
        <ActivityIndicator size="large" color="#2E8B57" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="Dashboard" component={ClientTabs} />
      ) : (
        <>
          <Stack.Screen name="ClinicsDirectory" component={ClinicsDirectory} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
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
