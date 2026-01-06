import React from "react";
import { View, Text, StyleSheet } from "react-native";

const AboutScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🐾 DCAN</Text>

      <Text style={styles.text}>
        DCAN es una aplicación móvil que conecta a los dueños de mascotas
        con veterinarias para agendar citas y recibir atención profesional.
      </Text>

      <Text style={styles.text}>
        Pensada para facilitar el cuidado y bienestar de las mascotas.
      </Text>

      <Text style={styles.author}>
        Desarrollado por: Eulises Sánchez
      </Text>
    </View>
  );
};

export default AboutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  author: {
    marginTop: 20,
    fontSize: 14,
    fontStyle: "italic",
  },
});
