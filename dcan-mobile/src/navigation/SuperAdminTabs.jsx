import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// SuperAdmin screens
import AdminHomeScreen from "../screens/admin/AdminHomeScreen";
import ClinicsScreen from "../screens/admin/ClinicsScreen";
import UsersScreen from "../screens/admin/UsersScreen";
import ProfileScreenSuperAdmin from "../screens/admin/ProfileScreenSuperAdmin";
import CatalogScreen from "../screens/admin/CatalogScreen"; 

const Tab = createBottomTabNavigator();

export default function SuperAdminTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: "#eee",
          borderTopWidth: 1,
          elevation: 10, // Sombra en Android
          // --- AQUÍ ESTÁ EL AJUSTE ---
          height: Platform.OS === 'ios' ? 100 :100, // Más alto para que no choque
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
        name="AdminHome"
        component={AdminHomeScreen}
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="Clinics"
        component={ClinicsScreen}
        options={{
          title: "Clínicas",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="domain" color={color} size={28} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Catalog"
        component={CatalogScreen}
        options={{
          title: "Catálogo",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shape-plus" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="Users"
        component={UsersScreen}
        options={{
          title: "Usuarios",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-multiple" color={color} size={28} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileSuperAdmin"
        component={ProfileScreenSuperAdmin}
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" color={color} size={28} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}