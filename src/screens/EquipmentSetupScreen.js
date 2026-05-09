import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, Platform,
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';

export default function EquipmentSetupScreen({ route, navigation }) {
  const { site, date } = route.params || {};
  const [bluetoothConnected, setBluetoothConnected] = useState(false);

  function handleContinue() {
    if (!bluetoothConnected) {
      Alert.alert(
        'Bluetooth not connected',
        'Make sure your device is powered on and paired in Bluetooth settings.',
      );
      return;
    }
    proceedToCollection();
  }

  function proceedToCollection() {
    if (!site || !date) {
      navigation.goBack();
      return;
    }
    navigation.navigate('SurveyPointSetup', { site, date });
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
        
          <TouchableOpacity 
            style={s.statusBlock} 
            onPress={() => setBluetoothConnected(prev => !prev)}
            activeOpacity={0.7}
          >
            <View style={[s.checkbox, bluetoothConnected && s.checkboxChecked]}>
            {bluetoothConnected && <Text style={s.checkmark}>✓</Text>}
            </View>
            <View style={s.statusText}>
            <Text style={s.statusLabel}>
                {bluetoothConnected ? 'Speaker connected' : 'Speaker not connected'}
            </Text>
            <Text style={s.statusDescription}>
                {bluetoothConnected
                ? 'Bluetooth speaker confirmed connected'
                : 'Tap to confirm your Bluetooth speaker is connected and ready.'}
            </Text>
            </View>
          </TouchableOpacity>
        </View>

      </View>

      

      <View style={s.footer}>
        <TouchableOpacity style={s.continueBtn} onPress={handleContinue}>
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
  statusIndicator: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ccc', marginRight: 12, marginTop: 3, flexShrink: 0 },
  statusText: { flex: 1 },
  statusLabel: { fontSize: 14, fontWeight: '500', color: '#1a1a1a', marginBottom: 4 },
  statusDescription: { fontSize: 13, color: '#666', lineHeight: 18 },
  statusBlock: { flexDirection: 'row', alignItems: 'flex-start', paddingBottom: 4, marginTop: 16 },
  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#ccc',
    backgroundColor: '#fafafa',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, marginTop: 2, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#639922', borderColor: '#4a7518' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 15 },
  infoCard: {
    backgroundColor: '#E6F1FB',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#85B7EB',
    padding: 14,
  },
  infoTitle: { fontSize: 12, fontWeight: '600', color: '#0C447C', marginBottom: 10, textTransform: 'uppercase' },
  infoBullet: { flexDirection: 'row', marginBottom: 8 },
  infoBulletText: { fontSize: 13, color: '#0C447C', marginRight: 8, fontWeight: '600' },
  infoText: { fontSize: 13, color: '#0C447C', flex: 1, lineHeight: 18 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#ddd' },
  continueBtn: { backgroundColor: '#E6F1FB', borderRadius: 8, borderWidth: 0.5, borderColor: '#85B7EB', padding: 14, alignItems: 'center' },
  continueBtnText: { color: '#0C447C', fontSize: 16, fontWeight: '500' },
});
