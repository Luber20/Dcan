import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Title, HelperText } from 'react-native-paper';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function CreateClinicScreen() {
    const { token } = useAuth();
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [hours, setHours] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleCreateClinic = async () => {
        setLoading(true);
        setErrors({});
        try {
            await axios.post(`${API_URL}/clinics`, {
                name,
                address,
                phone,
                hours,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigation.goBack();
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                console.error("Error creating clinic:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Title style={styles.title}>Registrar Nueva Clínica</Title>
            
            <TextInput
                label="Nombre de la clínica"
                value={name}
                onChangeText={setName}
                style={styles.input}
                error={!!errors.name}
            />
            {errors.name && <HelperText type="error">{errors.name[0]}</HelperText>}

            <TextInput
                label="Dirección"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
                error={!!errors.address}
            />
            {errors.address && <HelperText type="error">{errors.address[0]}</HelperText>}

            <TextInput
                label="Teléfono"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
                error={!!errors.phone}
            />
            {errors.phone && <HelperText type="error">{errors.phone[0]}</HelperText>}

            <TextInput
                label="Horarios (ej. L-V 9am-5pm)"
                value={hours}
                onChangeText={setHours}
                style={styles.input}
                error={!!errors.hours}
            />
            {errors.hours && <HelperText type="error">{errors.hours[0]}</HelperText>}

            <Button
                mode="contained"
                onPress={handleCreateClinic}
                loading={loading}
                disabled={loading}
                style={styles.button}
            >
                Crear Clínica
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