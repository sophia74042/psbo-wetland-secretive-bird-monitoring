import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Platform,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';

export default function EquipmentSetupScreen({ route, navigation }) {
  const { site, env } = route.params || {};
  const [bluetoothConnected, setBluetoothConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const bleManagerRef = useRef(null);

  useEffect(() => {
    // Initialize BleManager on first mount
    if (!bleManagerRef.current) {
      try {
        bleManagerRef.current = new BleManager();
      } catch (error) {
        console.error('Failed to initialize BleManager:', error);
        setBluetoothConnected(false);
        return;
      }
    }

    checkBluetoothConnection();

    // Cleanup on unmount
    return () => {
      try {
        bleManagerRef.current?.stopDeviceScan();
        bleManagerRef.current?.destroy();
        bleManagerRef.current = null;
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };
  }, []);

  async function checkBluetoothConnection() {
    setIsChecking(true);
    try {
      const manager = bleManagerRef.current;
      
      if (!manager) {
        setBluetoothConnected(false);
        setIsChecking(false);
        return;
      }

      // Check if Bluetooth is enabled
      const state = await manager.state();
      
      if (state !== 'PoweredOn') {
        setBluetoothConnected(false);
        setIsChecking(false);
        return;
      }

      // Request permissions (Android 12+)
      if (Platform.OS === 'android') {
        try {
          await manager.requestPermissions();
        } catch (error) {
          console.warn('Permission request error:', error);
        }
      }

      // Scan for devices for 5 seconds
      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          setBluetoothConnected(false);
          setIsChecking(false);
          manager.stopDeviceScan();
          return;
        }

        // If we find any connectable device, consider Bluetooth as available
        if (device && device.isConnectable) {
          setBluetoothConnected(true);
          manager.stopDeviceScan();
          setIsChecking(false);
        }
      });

      // Stop scanning after 5 seconds
      setTimeout(() => {
        manager.stopDeviceScan();
        setIsChecking(false);
      }, 5000);
    } catch (error) {
      console.error('Error checking Bluetooth:', error);
      setBluetoothConnected(false);
      setIsChecking(false);
    }
  }

  function handleContinue() {
    if (!bluetoothConnected) {
      Alert.alert(
        'Bluetooth not connected',
        'No Bluetooth device detected. Make sure your device is powered on and paired. Do you want to continue anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue anyway', onPress: proceedToCollection },
        ]
      );
      return;
    }
    proceedToCollection();
  }

  function proceedToCollection() {
    if (!site || !env) {
      navigation.goBack();
      return;
    }
    navigation.navigate('SurveyPointSetup', { site, env });
  }

  return (
    <View style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.heading}>Equipment Setup</Text>
      </View>

      <View style={s.content}>
        <View style={s.card}>
          <Text style={s.sectionTitle}>Bluetooth Connection</Text>
          
          <View style={s.statusBlock}>
            <View style={[s.statusIndicator, bluetoothConnected && s.statusIndicatorConnected]} />
            <View style={s.statusText}>
              <Text style={s.statusLabel}>
                {isChecking ? 'Checking...' : bluetoothConnected ? 'Connected' : 'Not Connected'}
              </Text>
              <Text style={s.statusDescription}>
                {isChecking 
                  ? 'Scanning for Bluetooth devices...'
                  : bluetoothConnected
                    ? 'Bluetooth device detected and connected'
                    : 'No Bluetooth device connected. Connect to your Bluetooth speaker before continuing.'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={s.checkBtn}
            onPress={checkBluetoothConnection}
            disabled={isChecking}
          >
            <Text style={s.checkBtnText}>
              {isChecking ? 'Checking...' : 'Check Bluetooth'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={s.infoCard}>
          <Text style={s.infoTitle}>Before you continue:</Text>
          <View style={s.infoBullet}>
            <Text style={s.infoBulletText}>•</Text>
            <Text style={s.infoText}>Make sure your Bluetooth speaker or receiver is powered on</Text>
          </View>
          <View style={s.infoBullet}>
            <Text style={s.infoBulletText}>•</Text>
            <Text style={s.infoText}>Ensure it is paired with your phone in Bluetooth settings</Text>
          </View>
          <View style={s.infoBullet}>
            <Text style={s.infoBulletText}>•</Text>
            <Text style={s.infoText}>Check that the volume is set appropriately</Text>
          </View>
        </View>
      </View>

      <View style={s.footer}>
        <TouchableOpacity style={s.continueBtn} onPress={handleContinue} disabled={isChecking}>
          <Text style={s.continueBtnText}>
            {bluetoothConnected ? 'Continue to survey →' : 'Continue anyway →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f3' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  backBtn: { color: '#378ADD', fontSize: 14, marginRight: 12 },
  heading: { fontSize: 18, fontWeight: '500', color: '#1a1a1a', flex: 1 },
  content: { flex: 1, padding: 16, paddingBottom: 120 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#ddd',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 16, textTransform: 'uppercase' },
  statusBlock: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  statusIndicator: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ccc', marginRight: 12, marginTop: 3, flexShrink: 0 },
  statusIndicatorConnected: { backgroundColor: '#639922' },
  statusText: { flex: 1 },
  statusLabel: { fontSize: 14, fontWeight: '500', color: '#1a1a1a', marginBottom: 4 },
  statusDescription: { fontSize: 13, color: '#666', lineHeight: 18 },
  checkBtn: { backgroundColor: '#E6F1FB', borderRadius: 8, borderWidth: 0.5, borderColor: '#85B7EB', paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  checkBtnText: { color: '#0C447C', fontSize: 14, fontWeight: '500' },
  infoCard: {
    backgroundColor: '#EAF3DE',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#97C459',
    padding: 14,
  },
  infoTitle: { fontSize: 12, fontWeight: '600', color: '#27500A', marginBottom: 10, textTransform: 'uppercase' },
  infoBullet: { flexDirection: 'row', marginBottom: 8 },
  infoBulletText: { fontSize: 13, color: '#27500A', marginRight: 8, fontWeight: '600' },
  infoText: { fontSize: 13, color: '#27500A', flex: 1, lineHeight: 18 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#ddd' },
  continueBtn: { backgroundColor: '#E6F1FB', borderRadius: 8, borderWidth: 0.5, borderColor: '#85B7EB', padding: 14, alignItems: 'center' },
  continueBtnText: { color: '#0C447C', fontSize: 16, fontWeight: '500' },
});
