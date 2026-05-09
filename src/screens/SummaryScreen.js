import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SPECIES, MINUTES, OBS_COLORS } from '../data/constants';
import { File, Paths } from 'expo-file-system/next';

function buildCSV(site, env, obsData) {
  const header = [
    'Site', 'Date', 'Temp_C', 'Cloud_pct', 'Precip', 'Wind', 'Noise',
  ].join(',');

  const dataheader = [
    'Point', 'Latitude', 'Longitude', 'Minute', 'Cycle', 'Playing',
    'Species', 'Individual', 'Detection', 'Distance_m', 'Notes',
  ]

  const lines = [header];
  lines.push([
              `"${site.name}"`, env.date, env.temp, env.cloud,
              env.precip, `"${env.wind}"`, `"${env.noise}"`]);

  lines.push(dataheader);
  
  site.coords.forEach((coord, ci) => {
    MINUTES.forEach((m, mi) => {
      SPECIES.forEach(sp => {
        const dets = obsData[ci][mi][sp];
        if (dets.length > 0) {
          dets.forEach((d, di) => {
              lines.push([
              ci + 1, coord.lat, coord.lng,
              m.min, m.cycle, `"${m.playing}"`,
              sp, di + 1, d.obs, d.dist || '', `"${(d.notes || '').replace(/"/g, '""')}"`,
            ].join(','));
          });
        }
      });
    });
  });

  return lines.join('\n');
}

export default function SummaryScreen({ route, navigation }) {
  const { site, env, obsData } = route.params;
  async function handleExport() {
    try {
      const csv = buildCSV(site, env, obsData);
      const filename = `survey_${site.name.replace(/\s+/g, '_')}_${env.date}.csv`;
      const file = new File(Paths.document, filename);
      await file.write(csv);
      await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: 'Export survey CSV' });
    } catch (e) {
      Alert.alert('Export failed', e.message);
    }
  }

  return (
    <View style={s.container}>
      <View style={s.topBar}>
        <Text style={s.heading}>Survey complete</Text>
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          <Text style={s.cardTitle}>Site & conditions</Text>
          {[
            ['Site', site.name],
            ['Date', env.date],
            ['Temp', env.temp ? `${env.temp}°C` : '—'],
            ['Cloud cover', env.cloud ? `${env.cloud}%` : '—'],
            ['Precipitation', env.precip],
            ['Wind', env.wind],
            ['Noise', env.noise],
          ].map(([k, v]) => (
            <View key={k} style={s.summRow}>
              <Text style={s.summKey}>{k}</Text>
              <Text style={s.summVal}>{v}</Text>
            </View>
          ))}
        </View>

        {site.coords.map((coord, ci) => {
          const anyDet = SPECIES.some(sp => MINUTES.some((_, mi) => obsData[ci][mi][sp].length > 0));
          return (
            <View key={ci} style={s.card}>
              <Text style={s.cardTitle}>Point {ci + 1}</Text>
              <Text style={s.coordText}>{coord.lat.toFixed(4)}, {coord.lng.toFixed(4)}</Text>
              {!anyDet && <Text style={s.noDet}>No detections recorded</Text>}
              {SPECIES.map(sp => {
                const allDets = [];
                MINUTES.forEach((m, mi) => {
                  obsData[ci][mi][sp].forEach(d => allDets.push({ min: m.min, ...d }));
                });
                if (!allDets.length) return null;
                return (
                  <View key={sp} style={s.summRow}>
                    <Text style={s.spLabel}>{sp}</Text>
                    <View style={s.chipsWrap}>
                      {allDets.map((d, i) => (
                        <View key={i} style={[s.chip, { backgroundColor: OBS_COLORS[d.obs].bg, borderColor: OBS_COLORS[d.obs].border }]}>
                          <Text style={[s.chipText, { color: OBS_COLORS[d.obs].text }]}>
                            {d.obs}{d.dist ? ' · ' + d.dist + 'm' : ''}{d.notes ? ' · note' : ''} m{d.min}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}

        <TouchableOpacity style={s.exportBtn} onPress={handleExport}>
          <Text style={s.exportBtnText}>Export CSV →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.newBtn} onPress={() => navigation.popToTop()}>
          <Text style={s.newBtnText}>Start new survey</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f3' },
  topBar: { paddingHorizontal: 16, paddingTop: 56, paddingBottom: 14, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#ddd' },
  heading: { fontSize: 22, fontWeight: '500', color: '#1a1a1a' },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#ddd', padding: 16, marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '500', color: '#1a1a1a', marginBottom: 10 },
  coordText: { fontSize: 12, color: '#888', marginBottom: 8 },
  summRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 5, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0', flexWrap: 'wrap', gap: 4 },
  summKey: { fontSize: 13, color: '#888' },
  summVal: { fontSize: 13, color: '#1a1a1a', fontWeight: '400', textAlign: 'right', flex: 1, marginLeft: 8 },
  spLabel: { fontSize: 13, fontWeight: '500', color: '#1a1a1a', marginRight: 8, paddingTop: 2 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, flex: 1, justifyContent: 'flex-end' },
  chip: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 0.5 },
  chipText: { fontSize: 11, fontWeight: '500' },
  noDet: { fontSize: 13, color: '#aaa', paddingVertical: 4 },
  exportBtn: { backgroundColor: '#E6F1FB', borderRadius: 8, borderWidth: 0.5, borderColor: '#85B7EB', padding: 14, alignItems: 'center', marginBottom: 10 },
  exportBtnText: { color: '#0C447C', fontSize: 16, fontWeight: '500' },
  newBtn: { borderRadius: 8, borderWidth: 0.5, borderColor: '#ccc', padding: 14, alignItems: 'center' },
  newBtnText: { color: '#555', fontSize: 15 },
});
