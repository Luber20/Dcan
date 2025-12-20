import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

export default function HeaderRightLogout() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // No navegamos manualmente, el conditional rendering en App.js lo hace
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={{ marginRight: 20 }}>
      <Ionicons name="log-out-outline" size={30} color="#fff" />
    </TouchableOpacity>
  );
}