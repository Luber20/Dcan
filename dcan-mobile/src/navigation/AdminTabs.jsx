import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// Screens
import AdminHomeScreen from "../screens/admin/AdminHomeScreen";
import ClinicsScreen from "../screens/admin/ClinicsScreen";
import UsersScreen from "../screens/admin/UsersScreen";
import ProfileScreenSuperAdmin from "../screens/admin/ProfileScreenSuperAdmin"; // ✅

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
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
          height: 62,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Clinics"
        component={ClinicsScreen}
        options={{
          title: "Clínicas",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="domain" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Users"
        component={UsersScreen}
        options={{
          title: "Usuarios",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-multiple" color={color} size={size} />
          ),
        }}
      />

      {/* ✅ TAB PERFIL */}
      <Tab.Screen
        name="ProfileSuperAdmin"
        component={ProfileScreenSuperAdmin}
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
