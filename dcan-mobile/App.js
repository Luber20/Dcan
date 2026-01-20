import React, { useEffect, useMemo } from "react";
import { View, ActivityIndicator, Text, Button } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

// Pantallas
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import ClinicsDirectory from "./src/screens/public/ClinicsDirectory";
import ClinicDetailsScreen from "./src/screens/public/ClinicDetailsScreen"; 
import ClientTabs from "./src/navigation/ClientTabs";
import AdminTabs from "./src/navigation/AdminTabs";
import SuperAdminTabs from "./src/navigation/SuperAdminTabs";
import VetTabs from "./src/navigation/VetTabs";

const Stack = createNativeStackNavigator();

function AppContent() {
  const { user, loading, loadToken, logout } = useAuth(); // Importamos logout por si acaso
  const { setUserKey } = useTheme();

  useEffect(() => { loadToken(); }, []);
  useEffect(() => { setUserKey(user?.email || "guest"); }, [user]);

  const role = useMemo(() => {
    if (user?.role) return user.role;
    if (user?.roles?.length) return user.roles[0]?.name;
    return null;
  }, [user]);

  if (loading) return <View style={{flex:1,justifyContent:'center'}}><ActivityIndicator size="large" color="#2E8B57"/></View>;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // 🌍 ZONA PÚBLICA (Aquí SI existe Login)
        <Stack.Group>
          <Stack.Screen name="ClinicsDirectory" component={ClinicsDirectory} />
          <Stack.Screen name="ClinicDetails" component={ClinicDetailsScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Group>
      ) : (
        // 🔐 ZONA PRIVADA (Aquí NO existe Login, pero existen los Dashboards)
        <Stack.Group>
          {(role === "superadmin" || role === "super_admin") && <Stack.Screen name="SuperAdminDashboard" component={SuperAdminTabs} />}
          {(role === "clinic_admin" || role === "admin") && <Stack.Screen name="AdminDashboard" component={AdminTabs} />}
          
          {(role === "cliente" || role === "client") && (
             <Stack.Group>
                <Stack.Screen name="ClientDashboard" component={ClientTabs} />
                <Stack.Screen name="ClinicDetails" component={ClinicDetailsScreen} />
             </Stack.Group>
          )}
          {/* Esta es la puerta para el veterinario */}
{(role === "veterinarian" || role === "veterinario") && (
  <Stack.Screen name="VetDashboard" component={VetTabs} />
)}

          {/* Fallback por si el rol falla */}
{(!role || !["superadmin","super_admin","clinic_admin","admin","cliente","client", "veterinarian", "veterinario"].includes(role)) && (
    <Stack.Screen name="ErrorRole" component={() => (
       <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
           <Text>Error de Rol o Sesión</Text>
           <Button title="Cerrar Sesión" onPress={logout}/>
       </View>
    )} />
)}
        </Stack.Group>
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