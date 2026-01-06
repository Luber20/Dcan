import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Card, Title, Paragraph, Avatar, FAB } from "react-native-paper";
import { useTheme } from "../../context/ThemeContext";

export default function PetsScreen() {
  const { theme } = useTheme();

  // Datos de ejemplo (luego conectas al backend)
  const pets = [
    { name: "Marti", breed: "Golden Retriever", age: "3 años", avatar: "M" },
    { name: "Luna", breed: "Gato Persa", age: "2 años", avatar: "L" },
    { name: "Toby", breed: "Bulldog", age: "5 años", avatar: "T" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        <Title style={[styles.title, { color: theme.colors.primary }]}>
          Mis Mascotas 🐕🐈
        </Title>

        <Paragraph style={[styles.subtitle, { color: theme.colors.subtitle }]}>
          Tienes {pets.length} mascotas registradas
        </Paragraph>

        {pets.map((pet, index) => (
          <Card
            key={index}
            style={[styles.card, { backgroundColor: theme.colors.card }]}
          >
            <Card.Content style={styles.petCard}>
              <Avatar.Text size={60} label={pet.avatar} style={styles.avatar} />
              <View style={styles.petInfo}>
                <Title style={[styles.petName, { color: theme.colors.text }]}>
                  {pet.name}
                </Title>
                <Paragraph style={[styles.petDetail, { color: theme.colors.subtitle }]}>
                  {pet.breed}
                </Paragraph>
                <Paragraph style={[styles.petDetail, { color: theme.colors.subtitle }]}>
                  {pet.age}
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
        onPress={() => console.log("Agregar mascota")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 30,
    marginBottom: 10,
  },
  subtitle: { fontSize: 18, textAlign: "center", marginBottom: 20 },
  card: { marginHorizontal: 20, marginVertical: 10, borderRadius: 20, elevation: 8 },
  petCard: { flexDirection: "row", alignItems: "center" },
  avatar: { backgroundColor: "#4CAF50" }, // puedes dejarlo fijo o hacerlo temático
  petInfo: { marginLeft: 20 },
  petName: { fontSize: 22 },
  petDetail: { fontSize: 16 },
  fab: { position: "absolute", margin: 20, right: 0, bottom: 0 },
});
