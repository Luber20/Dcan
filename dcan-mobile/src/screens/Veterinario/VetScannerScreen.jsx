import React, { useState } from 'react';
import { Text, View, StyleSheet, Alert, Button, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useIsFocused } from '@react-navigation/native'; 

export default function VetScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const isFocused = useIsFocused(); 

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{textAlign:'center', marginBottom:10, color:'white'}}>Necesitamos acceso a la cámara</Text>
        <Button onPress={requestPermission} title="Dar Permiso" color="#2E8B57" />
      </View>
    );
  }

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);

    try {
        const parsed = JSON.parse(data);

        // Validamos que sea un QR de nuestra app
        if (parsed.type === 'PET_ACCESS' && parsed.id) {
            Alert.alert("¡Mascota Detectada!", `Abriendo ficha de ${parsed.name}...`, [
                { 
                    text: "Ver Ficha", 
                    onPress: () => {
                        // Navegamos y pasamos el ID
                        navigation.navigate('VetPetDetail', { petId: parsed.id });
                        setScanned(false);
                    }
                }
            ]);
        } else {
            Alert.alert("QR Desconocido", "Este código no es válido.", [{ text: "OK", onPress: () => setScanned(false) }]);
        }
    } catch (e) {
        Alert.alert("Error", "No se pudo leer el código.", [{ text: "OK", onPress: () => setScanned(false) }]);
    }
  };

  return (
    <View style={styles.container}>
      {isFocused && (
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          />
      )}
      
      {/* Diseño Visual (Marco de escaneo) */}
      <View style={styles.overlay}>
        <View style={styles.scanBox} />
        <Text style={styles.text}>Escanea el Pasaporte Digital</Text>
        {scanned && <Button title="Escanear de nuevo" onPress={() => setScanned(false)} color="#2E8B57" />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  overlay: { position: 'absolute', alignItems: 'center' },
  scanBox: { width: 250, height: 250, borderWidth: 2, borderColor: '#00FF00', backgroundColor: 'transparent', marginBottom: 20 },
  text: { color: 'white', fontSize: 16, backgroundColor: 'rgba(0,0,0,0.5)', padding: 5, borderRadius: 5 }
});