import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import HeaderRightLogout from "../components/HeaderRightLogout";

// Import screens
import ClinicManagement from "../screens/admin/ClinicManagement";
import StaffManagement from "../screens/admin/StaffManagement";
import ClinicsList from "../screens/admin/ClinicsList"; // Make sure this is imported
import ClinicEdit from "../screens/admin/ClinicEdit"; // Make sure this is imported
import AdminProfileScreen from "../screens/admin/AdminProfileScreen"; // Make sure this is imported
import CreateClinicScreen from "../screens/admin/CreateClinicScreen"; // New screen
import CreateVetScreen from "../screens/admin/CreateVetScreen"; // New screen

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack para Clínica
function ClinicStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ClinicHome"
        component={ClinicManagement}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ClinicsList"
        component={ClinicsList}
        options={{ title: "Mis Clínicas" }}
      />
      <Stack.Screen
        name="ClinicEdit"
        component={ClinicEdit}
        options={{ title: "Editar Clínica" }}
      />
      <Stack.Screen
        name="CreateClinic"
        component={CreateClinicScreen}
        options={{ title: "Crear Nueva Clínica" }}
      />
    </Stack.Navigator>
  );
}

// Stack para Veterinarios
function StaffStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StaffHome"
        component={StaffManagement}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateVet"
        component={CreateVetScreen}
        options={{ title: "Crear Veterinario" }}
      />
    </Stack.Navigator>
  );
}

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => <HeaderRightLogout />,
        headerStyle: { backgroundColor: "#2E8B57" },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#2E8B57",
      }}
    >
      <Tab.Screen
        name="Clinic"
        component={ClinicStack}
        options={{
          title: "Clínica",
          tabBarIcon: ({ color, size, focused }) => (
            <Animatable.View
              animation={focused ? "bounce" : undefined}
              duration={500}
            >
              <Ionicons name="business-outline" size={size} color={color} />
            </Animatable.View>
          ),
        }}
      />

      <Tab.Screen
        name="Veterinarians"
        component={StaffStack}
        options={{
          title: "Veterinarios",
          tabBarIcon: ({ color, size, focused }) => (
            <Animatable.View
              animation={focused ? "bounce" : undefined}
              duration={500}
            >
              <Ionicons name="people-outline" size={size} color={color} />
            </Animatable.View>
          ),
        }}
      />

      <Tab.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size, focused }) => (
            <Animatable.View
              animation={focused ? "bounce" : undefined}
              duration={500}
            >
              <Ionicons name="person-circle-outline" size={size} color={color} />
            </Animatable.View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}
