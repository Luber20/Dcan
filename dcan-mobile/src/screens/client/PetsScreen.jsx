import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Title, Paragraph, Avatar, FAB } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";

export default function PetsScreen() {
  const { user } = useAuth();

  // Datos de ejemplo (luego puedes conectar al backend)
  const pets = [
    { name: "Marti", breed: "Golden Retriever", age: "3 años", avatar: "M" },
    { name: "Luna", breed: "Gato Persa", age: "2 años", avatar: "L" },
    { name: "Toby", breed: "Bulldog", age: "5 años", avatar: "T" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView>
        <Title style={styles.title}>Mis Mascotas 🐕🐈</Title>
        <Paragraph style={styles.subtitle}>Tienes {pets.length} mascotas registradas</Paragraph>

        {pets.map((pet, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content style={styles.petCard}>
              <Avatar.Text size={60} label={pet.avatar} style={styles.avatar} />
              <View style={styles.petInfo}>
                <Title style={styles.petName}>{pet.name}</Title>
                <Paragraph style={styles.petDetail}>{pet.breed}</Paragraph>
                <Paragraph style={styles.petDetail}>{pet.age}</Paragraph>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        color="#fff"
        onPress={() => console.log("Agregar mascota")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E8F5E8" },
  title: { fontSize: 32, fontWeight: "bold", color: "#2E8B57", textAlign: "center", marginTop: 30, marginBottom: 10 },
  subtitle: { fontSize: 18, color: "#666", textAlign: "center", marginBottom: 20 },
  card: { marginHorizontal: 20, marginVertical: 10, borderRadius: 20, elevation: 8 },
  petCard: { flexDirection: "row", alignItems: "center" },
  avatar: { backgroundColor: "#4CAF50" },
  petInfo: { marginLeft: 20 },
  petName: { fontSize: 22, color: "#2E8B57" },
  petDetail: { fontSize: 16, color: "#666" },
  fab: { position: "absolute", margin: 20, right: 0, bottom: 0, backgroundColor: "#2E8B57" },
});