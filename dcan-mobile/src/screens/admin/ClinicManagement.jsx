import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Title } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

export default function ClinicManagement() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Gestión de Clínica</Title>

      <Button
        icon="plus-circle"
        mode="contained"
        onPress={() => navigation.navigate('CreateClinic')}
        style={styles.button}
      >
        Agregar Clínica
      </Button>

      <Button
        icon="format-list-bulleted"
        mode="outlined"
        onPress={() => navigation.navigate('ClinicsList')}
        style={styles.button}
      >
        Ver Mis Clínicas
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 24,
  },
  button: {
    marginVertical: 10,
    paddingVertical: 8,
  },
});