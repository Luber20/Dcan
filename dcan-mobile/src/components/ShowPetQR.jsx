import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text, Button, IconButton, Avatar } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';

export default function ShowPetQR({ visible, onClose, pet }) {
  if (!pet) return null;

  // 🔐 DATOS QUE LLEVARÁ EL QR (Solo lo esencial)
  const qrData = JSON.stringify({
    id: pet.id,
    type: 'PET_ACCESS',
    name: pet.name
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Pasaporte Digital</Text>
            <IconButton icon="close" size={20} onPress={onClose} />
          </View>
          
          <Avatar.Icon size={60} icon="paw" style={{backgroundColor: '#2E8B57', marginBottom: 10}} />
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.sub}>Muestra este código al veterinario</Text>
          
          <View style={styles.qrContainer}>
            {/* Generamos el QR con los datos */}
            <QRCode value={qrData} size={200} />
          </View>

          <Button mode="contained" onPress={onClose} style={{marginTop: 20, width: '100%'}} buttonColor="#2E8B57">
            Listo
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modal: { backgroundColor: 'white', width: '85%', padding: 25, borderRadius: 20, alignItems: 'center', elevation: 10 },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#555' },
  petName: { fontSize: 24, fontWeight: 'bold', marginBottom: 5, color: '#2E8B57' },
  sub: { marginBottom: 20, color: '#888', fontSize: 14 },
  qrContainer: { padding: 15, backgroundColor: 'white', borderRadius: 15, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5 }
});