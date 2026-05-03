import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert,
} from 'react-native';
import { SITES, PRECIP_OPTIONS, WIND_OPTIONS, NOISE_OPTIONS } from '../data/constants';

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

export default function SiteSetupScreen({ navigation }) {
  const [siteIdx, setSiteIdx] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [temp, setTemp] = useState('');
  const [cloud, setCloud] = useState('');
  const [precip, setPrecip] = useState('');
  const [wind, setWind] = useState('');
  const [noise, setNoise] = useState('');

  function handleStart() {
    if (siteIdx === null) { Alert.alert('Select a site first.'); return; }
    if (!precip || !wind || !noise) { Alert.alert('Please complete all environmental fields.'); return; }
    if (wind === 'Too windy to survey') { Alert.alert('Conditions too adverse', 'Wind is too strong to survey.'); return; }
    if (noise === 'Too much noise to survey') { Alert.alert('Conditions too adverse', 'Noise level too high to survey.'); return; }

    const env = { temp, cloud, precip, wind, noise, date };
    navigation.navigate('Collection', { site: SITES[siteIdx], env });
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.heading}>New survey</Text>

      <View style={s.card}>
        <Text style={s.cardTitle}>Site</Text>
        {SITES.map((site, i) => (
          <TouchableOpacity
            key={site.name}
            style={[s.siteRow, siteIdx === i && s.siteRowActive]}
            onPress={() => setSiteIdx(i)}
          >
            <View style={[s.radio, siteIdx === i && s.radioActive]} />
            <View style={{ flex: 1 }}>
              <Text style={[s.siteName, siteIdx === i && s.siteNameActive]}>{site.name}</Text>
              <Text style={s.siteCoords}>{site.coords.length} points</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={s.fieldBlock}>
          <Text style={s.label}>Date</Text>
          <TextInput
            style={s.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#aaa"
          />
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>Environmental conditions</Text>

        <View style={s.row2}>
          <View style={[s.fieldBlock, { flex: 1, marginRight: 8 }]}>
            <Text style={s.label}>Temp (°C)</Text>
            <TextInput style={s.input} value={temp} onChangeText={setTemp}
              keyboardType="numeric" placeholder="e.g. 14" placeholderTextColor="#aaa" />
          </View>
          <View style={[s.fieldBlock, { flex: 1 }]}>
            <Text style={s.label}>Cloud cover (%)</Text>
            <TextInput style={s.input} value={cloud} onChangeText={setCloud}
              keyboardType="numeric" placeholder="0–100" placeholderTextColor="#aaa" />
          </View>
        </View>

        <PickerRow label="Precipitation" options={PRECIP_OPTIONS} value={precip} onChange={setPrecip} />
        <PickerRow label="Wind" options={WIND_OPTIONS} value={wind} onChange={setWind} />
        <PickerRow label="Noise" options={NOISE_OPTIONS} value={noise} onChange={setNoise} />
      </View>

      <TouchableOpacity style={s.btnPrimary} onPress={handleStart}>
        <Text style={s.btnPrimaryText}>Start survey →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f3' },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '500', color: '#1a1a1a', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#ddd', padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '500', color: '#1a1a1a', marginBottom: 12 },
  siteRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 8, marginBottom: 4, borderWidth: 0.5, borderColor: 'transparent' },
  siteRowActive: { backgroundColor: '#E6F1FB', borderColor: '#85B7EB' },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: '#bbb', marginRight: 10 },
  radioActive: { borderColor: '#378ADD', backgroundColor: '#378ADD' },
  siteName: { fontSize: 14, color: '#333', fontWeight: '400' },
  siteNameActive: { color: '#0C447C', fontWeight: '500' },
  siteCoords: { fontSize: 12, color: '#888', marginTop: 1 },
  fieldBlock: { marginTop: 10 },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  input: { borderWidth: 0.5, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 14, color: '#1a1a1a', backgroundColor: '#fafafa' },
  row2: { flexDirection: 'row', marginTop: 4 },
  pillScroll: { marginTop: 4 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 0.5, borderColor: '#ccc', marginRight: 6, backgroundColor: '#fafafa' },
  pillActive: { backgroundColor: '#E6F1FB', borderColor: '#85B7EB' },
  pillText: { fontSize: 13, color: '#555' },
  pillTextActive: { color: '#0C447C', fontWeight: '500' },
  btnPrimary: { backgroundColor: '#E6F1FB', borderRadius: 8, borderWidth: 0.5, borderColor: '#85B7EB', padding: 14, alignItems: 'center', marginTop: 4 },
  btnPrimaryText: { color: '#0C447C', fontSize: 16, fontWeight: '500' },
});
