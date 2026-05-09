import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SPECIES, MINUTES, PRECIP_OPTIONS, WIND_OPTIONS, NOISE_OPTIONS } from '../data/constants';

function PickerRow({ label, options, value, onChange }) {
  return (
    <View style={s.fieldBlock}>
      <Text style={s.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.pillScroll}>
        {options.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[s.pill, value === opt && s.pillActive]}
            onPress={() => onChange(opt)}
          >
            <Text style={[s.pillText, value === opt && s.pillTextActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

function initObs(site) {
  return site.coords.map(() =>
    MINUTES.map(() => {
      const row = {};
      SPECIES.forEach(sp => (row[sp] = []));
      return row;
    })
  );
}

export default function SurveyPointSetupScreen({ route, navigation }) {
  const { site, env = {}, obsData : passedObsData, environmentData: passedEnvData } = route.params;
  const coordIdx = route.params.coordIdx || 0; // start at first point
  const obsData = useMemo(
    () => passedObsData ?? initObs(site),
    [passedObsData, site]
  );  
  const coord = site.coords[coordIdx];

  const [landmarks, setLandmarks] = useState({});
  const [environmentData, setEnvironmentData] = useState(() => passedEnvData || {});
  const [currentName, setCurrentName] = useState('');
  const [currentDistance, setCurrentDistance] = useState('');
  
  // Get current environmental values for this coordIdx
  const currentEnv = environmentData[coordIdx] || {};
  const temp = currentEnv.temp || '';
  const cloud = currentEnv.cloud || '';
  const precip = currentEnv.precip || '';
  const wind = currentEnv.wind || '';
  const noise = currentEnv.noise || '';

  // Helper function to update environmental data for current point
  function updateEnvironment(key, value) {
    setEnvironmentData(prev => ({
      ...prev,
      [coordIdx]: { ...prev[coordIdx], [key]: value }
    }));
  }

  function addLandmark() {
    if (!currentName.trim()) {
      Alert.alert('Missing landmark name', 'Please enter a landmark name.');
      return;
    }
    if (!currentDistance.trim()) {
      Alert.alert('Missing distance', 'Please enter a distance.');
      return;
    }
    
    setLandmarks(prev => ({ ...prev, [coordIdx]: [...(prev[coordIdx] || []), { name: currentName.trim(), distance: currentDistance.trim() }] }));
    setCurrentName('');
    setCurrentDistance('');
  }

  function removeLandmark(index) {
    setLandmarks(prev => ({ ...prev, [coordIdx]: prev[coordIdx].filter((_, i) => i !== index) }));
  }

  function handleContinue() {
    navigation.push('Collection', { 
      site, 
      env, 
      obsData,
      landmarks,
      environmentData,
      coordIdx
    });
  }

  function goBack() {
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView 
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={s.header}>
        <TouchableOpacity onPress={goBack}>
          <Text style={s.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>Survey Point Setup</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={s.content} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Text style={s.subtitle}>Point {coordIdx + 1}</Text>
        <Text style={s.coordText}>{coord.lat.toFixed(4)}, {coord.lng.toFixed(4)}</Text>

         <View style={s.card}>
            <Text style={s.cardTitle}>Environmental conditions</Text>

            <View style={s.row2}>
                <View style={[s.fieldBlock, { flex: 1, marginRight: 8 }]}>
                <Text style={s.label}>Temp (°C)</Text>
                <TextInput style={s.input} value={temp} onChangeText={(v) => updateEnvironment('temp', v)}
                    keyboardType="numeric" placeholder="e.g. 14" placeholderTextColor="#aaa" />
                </View>
                <View style={[s.fieldBlock, { flex: 1 }]}>
                <Text style={s.label}>Cloud cover (%)</Text>
                <TextInput style={s.input} value={cloud} onChangeText={(v) => updateEnvironment('cloud', v)}
                    keyboardType="numeric" placeholder="0–100" placeholderTextColor="#aaa" />
                </View>
            </View>

            <PickerRow label="Precipitation" options={PRECIP_OPTIONS} value={precip} onChange={(v) => updateEnvironment('precip', v)} />
            <PickerRow label="Wind" options={WIND_OPTIONS} value={wind} onChange={(v) => updateEnvironment('wind', v)} />
            <PickerRow label="Noise" options={NOISE_OPTIONS} value={noise} onChange={(v) => updateEnvironment('noise', v)} />
        </View>
        
        <View style={s.section}>
          <Text style={s.sectionTitle}>Reference Landmarks</Text>
          <Text style={s.sectionDesc}>
            Add landmarks at this survey point with their distances. These will help you estimate distances when recording observations.
          </Text>

          {landmarks[coordIdx]?.length > 0 && (
            <View style={s.landmarksList}>
              {landmarks[coordIdx].map((landmark, i) => (
                <View key={i} style={s.landmarkItem}>
                  <View style={s.landmarkInfo}>
                    <Text style={s.landmarkName}>{landmark.name}</Text>
                    <Text style={s.landmarkDistance}>{landmark.distance} m</Text>
                  </View>
                  <TouchableOpacity 
                    style={s.deleteBtn}
                    onPress={() => removeLandmark(i)}
                  >
                    <Text style={s.deleteText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <View style={s.inputGroup}>
            <TextInput
              style={s.input}
              placeholder="Landmark name (e.g., 'Large oak tree')"
              placeholderTextColor="#aaa"
              value={currentName}
              onChangeText={setCurrentName}
            />
            <View style={s.distanceInputRow}>
              <TextInput
                style={[s.input, s.distanceInput]}
                placeholder="Distance"
                placeholderTextColor="#aaa"
                value={currentDistance}
                onChangeText={setCurrentDistance}
                keyboardType="numeric"
              />
              <Text style={s.distanceUnit}>m</Text>
            </View>
            <TouchableOpacity 
              style={s.addBtn}
              onPress={addLandmark}
            >
              <Text style={s.addBtnText}>+ Add Landmark</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.info}>
          <Text style={s.infoText}>
            You can update landmarks for each survey point as you move between locations.
          </Text>
        </View>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity 
          style={s.continueBtn}
          onPress={handleContinue}
        >
          <Text style={s.continueBtnText}>Continue to Survey →</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f3'
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
    paddingTop: 56, 
    paddingBottom: 16, 
    backgroundColor: '#fff', 
    borderBottomWidth: 0.5, 
    borderBottomColor: '#ddd' 
  },
  backBtn: { 
    color: '#378ADD', 
    fontSize: 14 
  },
  title: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#1a1a1a' 
  },
  content: { 
    flex: 1 
  },
  subtitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#555', 
    marginBottom: 4 
  },
  coordText: { 
    fontSize: 12, 
    color: '#888', 
    marginBottom: 20 
  },
  section: { 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#1a1a1a', 
    marginBottom: 6 
  },
  sectionDesc: { 
    fontSize: 13, 
    color: '#666', 
    marginBottom: 12, 
    lineHeight: 18 
  },
  landmarksList: { 
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#eee',
    overflow: 'hidden'
  },
  landmarkItem: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    backgroundColor: '#fafafa'
  },
  landmarkInfo: {
    flex: 1
  },
  landmarkName: { 
    fontSize: 13, 
    fontWeight: '500', 
    color: '#1a1a1a',
    marginBottom: 2
  },
  landmarkDistance: { 
    fontSize: 12, 
    color: '#888' 
  },
  deleteBtn: { 
    padding: 8,
    marginLeft: 12
  },
  deleteText: { 
    fontSize: 22, 
    color: '#ccc', 
    fontWeight: '300',
    lineHeight: 24
  },
  inputGroup: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#ddd',
    padding: 12,
    gap: 10
  },
  input: { 
    borderWidth: 0.5, 
    borderColor: '#ccc', 
    borderRadius: 6, 
    padding: 10, 
    fontSize: 13, 
    color: '#1a1a1a',
    backgroundColor: '#fafafa'
  },
  distanceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  distanceInput: {
    flex: 1,
    margin: 0
  },
  distanceUnit: { 
    fontSize: 13, 
    color: '#888',
    fontWeight: '500'
  },
  addBtn: { 
    backgroundColor: '#E6F1FB', 
    borderRadius: 6, 
    borderWidth: 0.5,
    borderColor: '#85B7EB',
    paddingVertical: 10,
    alignItems: 'center' 
  },
  addBtnText: { 
    color: '#378ADD', 
    fontSize: 13, 
    fontWeight: '600' 
  },
  fieldBlock: {
    marginBottom: 12
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8
  },
  pillScroll: {
    flexGrow: 0
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#fafafa',
    marginRight: 8
  },
  pillActive: {
    backgroundColor: '#E6F1FB',
    borderColor: '#85B7EB'
  },
  pillText: {
    fontSize: 13,
    color: '#555'
  },
  pillTextActive: {
    color: '#0C447C',
    fontWeight: '500'
  },
  row2: {
    flexDirection: 'row',
    marginBottom: 12
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12
  },
  info: {
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#d4e6f7',
    padding: 12
  },
  infoText: {
    fontSize: 12,
    color: '#1a5490',
    lineHeight: 16
  },
  footer: { 
    padding: 16, 
    paddingBottom: 32, 
    backgroundColor: '#fff', 
    borderTopWidth: 0.5, 
    borderTopColor: '#ddd' 
  },
  continueBtn: { 
    backgroundColor: '#E6F1FB', 
    borderRadius: 8, 
    borderWidth: 0.5,
    borderColor: '#85B7EB',
    paddingVertical: 14,
    alignItems: 'center'
  },
  continueBtnText: { 
    color: '#0C447C', 
    fontSize: 16, 
    fontWeight: '600' 
  },
});
