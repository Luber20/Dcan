import React from "react";
import { Platform } from "react-native"; // ✅ Importante para detectar si es Android/iOS
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import HeaderRightLogout from "../components/HeaderRightLogout";

// Importaciones desde la carpeta clinicAdmin
import MyClinicScreen from "../screens/clinicAdmin/MyClinicScreen";
import CreateVetScreen from "../screens/clinicAdmin/CreateVetScreen";
import AdminProfileScreen from "../screens/clinicAdmin/AdminProfileScreen";
import StaffManagement from "../screens/clinicAdmin/StaffManagement";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack 1: Gestión de Clínica
function ClinicStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MyClinic"
        component={MyClinicScreen}
        options={{ title: "Gestionar Mi Clínica" }}
      />
    </Stack.Navigator>
  );
}

// Stack 2: Gestión de Personal
function StaffStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StaffList"
        component={StaffManagement}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateVet"
        component={CreateVetScreen}
        options={{ title: "Nuevo Veterinario", headerBackTitle: "Volver" }}
      />
    </Stack.Navigator>
  );
}

// Navegador Principal de Pestañas
export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => <HeaderRightLogout />,
        headerStyle: { backgroundColor: "#2E8B57" },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#2E8B57",
        tabBarInactiveTintColor: "#999",
        
        // ✅ AQUÍ ESTÁ EL AJUSTE PARA SUBIR LOS TABS
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#eee",
          borderTopWidth: 1,
          elevation: 10,
          height: Platform.OS === 'ios' ? 100 : 100, // Más alto
          paddingBottom: Platform.OS === 'ios' ? 50 : 50, // Empuja los iconos hacia arriba
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 5
        },
      }}
    >
      <Tab.Screen
        name="Mi Clínica"
        component={ClinicStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Personal"
        component={StaffStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={AdminProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}