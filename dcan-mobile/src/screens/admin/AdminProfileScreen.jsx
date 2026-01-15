import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Avatar, Title, Caption, Button, Card, TextInput, Paragraph, HelperText } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../../config/api';

export default function AdminProfileScreen({ navigation }) {
    const { user, logout, token, loadToken } = useAuth();

    const [name, setName] = useState(user?.name || "");
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMsg, setProfileMsg] = useState("");
    const [profileErr, setProfileErr] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [savingPass, setSavingPass] = useState(false);
    const [passMsg, setPassMsg] = useState("");
    const [passErr, setPassErr] = useState("");

    const headers = useMemo(
        () => ({
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        }),
        [token]
    );

    const role = user?.role || (Array.isArray(user?.roles) && user.roles[0]?.name) || "Admin Clínica";

    const saveProfile = async () => {
        setProfileErr("");
        setProfileMsg("");
        if (!name.trim()) {
            setProfileErr("El nombre no puede estar vacío.");
            return;
        }
        setSavingProfile(true);
        try {
            await axios.patch(`${API_URL}/me`, { name: name.trim() }, { headers });
            setProfileMsg("Perfil actualizado correctamente.");
            await loadToken(); // Refresca el usuario en el contexto
        } catch (e) {
            setProfileErr("No se pudo actualizar el perfil.");
        } finally {
            setSavingProfile(false);
        }
    };

    const changePassword = async () => {
        setPassErr("");
        setPassMsg("");
        if (!currentPassword.trim() || !newPassword.trim()) {
            setPassErr("Completa la contraseña actual y la nueva.");
            return;
        }
        if (newPassword.trim().length < 8) {
            setPassErr("La nueva contraseña debe tener al menos 8 caracteres.");
            return;
        }
        setSavingPass(true);
        try {
            await axios.patch(
                `${API_URL}/me/password`,
                {
                    current_password: currentPassword.trim(),
                    new_password: newPassword.trim(),
                },
                { headers }
            );
            setPassMsg("Contraseña actualizada con éxito.");
            setCurrentPassword("");
            setNewPassword("");
        } catch (e) {
            setPassErr("No se pudo cambiar la contraseña. Verifica la actual.");
        } finally {
            setSavingPass(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Card style={styles.card}>
                <Card.Content style={styles.userInfoSection}>
                    <Avatar.Image
                        source={{
                            uri: user?.avatar_url || `https://ui-avatars.com/api/?name=${user?.name}&background=2E8B57&color=fff`,
                        }}
                        size={100}
                    />
                    <View style={styles.userDetails}>
                        <Title style={styles.title}>{user?.name}</Title>
                        <Paragraph>{user?.email}</Paragraph>
                        <Caption style={styles.caption}>Rol: {role}</Caption>
                    </View>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Editar información</Title>
                    <TextInput
                        label="Nombre de usuario"
                        value={name}
                        onChangeText={setName}
                        mode="outlined"
                        style={styles.input}
                    />
                    {!!profileErr && <HelperText type="error" visible={true}>{profileErr}</HelperText>}
                    {!!profileMsg && <HelperText type="info" visible={true}>{profileMsg}</HelperText>}
                    <Button
                        mode="contained"
                        icon="content-save"
                        onPress={saveProfile}
                        loading={savingProfile}
                        disabled={savingProfile}
                        style={styles.button}
                    >
                        Guardar cambios
                    </Button>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Seguridad</Title>
                    <TextInput
                        label="Contraseña actual"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                        mode="outlined"
                        style={styles.input}
                    />
                    <TextInput
                        label="Nueva contraseña"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        mode="outlined"
                        style={styles.input}
                    />
                    {!!passErr && <HelperText type="error" visible={true}>{passErr}</HelperText>}
                    {!!passMsg && <HelperText type="info" visible={true}>{passMsg}</HelperText>}
                    <Button
                        mode="contained"
                        icon="lock-reset"
                        onPress={changePassword}
                        loading={savingPass}
                        disabled={savingPass}
                        style={styles.button}
                    >
                        Cambiar contraseña
                    </Button>
                </Card.Content>
            </Card>

            <Card style={styles.card}>
                <Card.Content>
                    <Button
                        mode="outlined"
                        onPress={logout}
                        icon="logout"
                        textColor="#D32F2F"
                        borderColor="#D32F2F"
                    >
                        Cerrar Sesión
                    </Button>
                </Card.Content>
            </Card>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4f4f4',
        paddingVertical: 10,
    },
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        elevation: 2,
    },
    userInfoSection: {
        alignItems: 'center',
        paddingBottom: 10,
    },
    userDetails: {
        alignItems: 'center',
        marginTop: 15,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    caption: {
        fontSize: 14,
        lineHeight: 14,
        fontWeight: '500',
        color: '#6e6e6e',
        marginTop: 4,
    },
    cardTitle: {
        marginBottom: 10,
    },
    input: {
        marginBottom: 10,
    },
    button: {
        marginTop: 10,
    },
});