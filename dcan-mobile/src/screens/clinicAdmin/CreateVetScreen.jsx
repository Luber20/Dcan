import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Title, HelperText } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function CreateVetScreen() {
    const { token } = useAuth();
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleCreateVet = async () => {
        setLoading(true);
        setErrors({});
        try {
            // Asumimos que el backend asocia este nuevo usuario a la clínica del admin
            await axios.post(`${API_URL}/clinic/users`, {
                name,
                email,
                password,
                role: 'veterinarian' // El backend debe asignar este rol
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigation.goBack();
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error("Error creando veterinario:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Title style={styles.title}>Registrar Nuevo Veterinario</Title>
            
            <TextInput
                label="Nombre completo"
                value={name}
                onChangeText={setName}
                style={styles.input}
                error={!!errors.name}
            />
            {errors.name && <HelperText type="error">{errors.name[0]}</HelperText>}

            <TextInput
                label="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
            />
            {errors.email && <HelperText type="error">{errors.email[0]}</HelperText>}

            <TextInput
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                secureTextEntry
                error={!!errors.password}
            />
            {errors.password && <HelperText type="error">{errors.password[0]}</HelperText>}

            <Button
                mode="contained"
                onPress={handleCreateVet}
                loading={loading}
                disabled={loading}
                style={styles.button}
            >
                Crear Veterinario
            </Button>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { marginBottom: 20, textAlign: 'center' },
    input: { marginBottom: 10 },
    button: { marginTop: 20, paddingVertical: 8 },
});