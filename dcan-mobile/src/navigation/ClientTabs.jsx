import React, { useEffect, useState, useMemo } from "react";
import { View, ActivityIndicator, Text, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Button } from "react-native-paper";
import HeaderRightLogout from "../components/HeaderRightLogout";
import axios from "axios";
import { API_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

// --- IMPORTACIÓN DE PANTALLAS ---
import HomeScreen from "../screens/client/HomeScreen";
import PetsScreen from "../screens/client/PetsScreen";
import AddPetScreen from "../screens/client/AddPetScreen";
import EditPetScreen from "../screens/client/EditPetScreen";
import ScheduleScreen from "../screens/client/ScheduleScreen";
import AppointmentsScreen from "../screens/client/AppointmentsScreen";
import ProfileScreen from "../screens/client/ProfileScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 1️⃣ Stack de Mascotas
function PetsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PetsList" component={PetsScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="AddPet"
        component={AddPetScreen}
        options={{ title: "Nueva Mascota", headerStyle: { backgroundColor: "#2E8B57" }, headerTintColor: "#fff" }}
      />
      <Stack.Screen
        name="EditPet"
        component={EditPetScreen}
        options={{ title: "Editar Mascota", headerStyle: { backgroundColor: "#2E8B57" }, headerTintColor: "#fff" }}
      />
    </Stack.Navigator>
  );
}

// 2️⃣ DICCIONARIO DE PANTALLAS
const SCREEN_COMPONENTS = {
  HomeScreen: HomeScreen,
  PetsStack: PetsStack,
  ScheduleScreen: ScheduleScreen,
  AppointmentsScreen: AppointmentsScreen,
  ProfileScreen: ProfileScreen,
};

// ✅ 3) MENÚ DEFAULT PARA CLIENT (cuando /my-menu viene vacío)
const DEFAULT_CLIENT_MENUS = [
  { id: "default-1", name: "Inicio", icon: "home", screen_name: "HomeScreen" },
  { id: "default-2", name: "Mascotas", icon: "paw", screen_name: "PetsStack" },
  { id: "default-3", name: "Agendar", icon: "calendar", screen_name: "ScheduleScreen" },
  { id: "default-4", name: "Citas", icon: "list", screen_name: "AppointmentsScreen" },
  { id: "default-5", name: "Perfil", icon: "person", screen_name: "ProfileScreen" },
];

export default function ClientTabs({ navigation }) {
  const { logout } = useAuth();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);

  useEffect(() => {
    fetchMyMenu();
  }, []);

  const fetchMyMenu = async () => {
    try {
      setMenuError(null);
      const response = await axios.get(`${API_URL}/my-menu`);
      setMenus(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("❌ ERROR /my-menu:", error.response?.data || error.message);
      setMenus([]);
      setMenuError("No se pudo cargar el menú del servidor.");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName, color, size) => {
    if (iconName === "paw") {
      return <MaterialCommunityIcons name={iconName} size={size + 4} color={color} />;
    }
    return <Ionicons name={iconName} size={size} color={color} />;
  };

  // ✅ Menú efectivo: si el backend no manda nada, usamos el default del cliente
  const effectiveMenus = useMemo(() => {
    return menus && menus.length > 0 ? menus : DEFAULT_CLIENT_MENUS;
  }, [menus]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2E8B57" />
        <Text style={{ marginTop: 10, color: "#666" }}>Cargando menú...</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => <HeaderRightLogout navigation={navigation} />,
        headerStyle: { backgroundColor: "#2E8B57", height: Platform.OS === "ios" ? 110 : 90 },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold", fontSize: 22 },
        tabBarActiveTintColor: "#2E8B57",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#eee",
          borderTopWidth: 1,
          elevation: 10,
          height: Platform.OS === "ios" ? 100 : 100,
          paddingBottom: Platform.OS === "ios" ? 50 : 50,
          paddingTop: 10,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600", marginBottom: 5 },
      }}
    >
      {/* ✅ Si hubo error y se usó el menú default, NO bloqueamos al usuario */}
      {menuError && (
        <Tab.Screen
          name="Aviso"
          component={() => (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
              <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#FFA500" />
              <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10, textAlign: "center" }}>
                {menuError}
              </Text>
              <Text style={{ marginTop: 8, color: "#666", textAlign: "center" }}>
                Se cargó el menú por defecto para continuar.
              </Text>
              <Button
                mode="contained"
                onPress={fetchMyMenu}
                style={{ backgroundColor: "#2E8B57", marginTop: 16 }}
              >
                Reintentar
              </Button>
              <Button mode="text" onPress={logout} style={{ marginTop: 10 }} textColor="#2E8B57">
                Cerrar Sesión
              </Button>
            </View>
          )}
          options={{
            tabBarButton: () => null, // ✅ no aparece como tab
            headerTitle: "Aviso",
          }}
        />
      )}

      {effectiveMenus.map((menu) => {
        const Component = SCREEN_COMPONENTS[menu.screen_name];
        if (!Component) return null;

        return (
          <Tab.Screen
            key={menu.id}
            name={menu.name}
            component={Component}
            options={{
              tabBarIcon: ({ color }) => getIcon(menu.icon, color, 28),
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
}
