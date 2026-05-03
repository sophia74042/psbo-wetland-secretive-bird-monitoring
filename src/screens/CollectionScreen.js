import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SPECIES, MINUTES, OBS_TYPES, OBS_COLORS } from '../data/constants';

function initObs(site) {
  return site.coords.map(() =>
    MINUTES.map(() => {
      const row = {};
      SPECIES.forEach(sp => (row[sp] = []));
      return row;
    })
  );
}

function allMinutesFilled(obsData, coordIdx) {
  return MINUTES.every((_, mi) =>
    SPECIES.some(sp => obsData[coordIdx][mi][sp].length > 0)
  );
}

function hasAnyObservations(obsData, coordIdx) {
  return MINUTES.some((_, mi) =>
    SPECIES.some(sp => obsData[coordIdx][mi][sp].length > 0)
  );
}

function DetectionModal({ visible, coordIdx, minuteIdx, species, detections, onClose, onSave }) {
  const [localDets, setLocalDets] = useState(() => detections.map(d => ({ ...d })));

  function addIndividual() {
    setLocalDets(prev => [...prev, { obs: 'H', dist: '' }]);
  }

  function updateObs(i, obs) {
    setLocalDets(prev => prev.map((d, idx) => idx === i ? { ...d, obs } : d));
  }

  function updateDist(i, dist) {
    setLocalDets(prev => prev.map((d, idx) => idx === i ? { ...d, dist } : d));
  }

  function removeIndividual(i) {
    setLocalDets(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleSave() {
    onSave(localDets);
    onClose();
  }

  const m = MINUTES[minuteIdx];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView 
        style={ms.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={ms.header}>
          <Text style={ms.title}>{species} · minute {m ? m.min : ''}</Text>
          <Text style={ms.subtitle}>{m ? m.playing : ''}</Text>
        </View>
        <ScrollView style={ms.scroll} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
          {localDets.map((det, i) => (
            <View key={i} style={ms.indRow}>
              <Text style={ms.indNum}>{i + 1}.</Text>
              <View style={{ flex: 1 }}>
                <View style={ms.obsToggle}>
                  {OBS_TYPES.map(v => (
                    <TouchableOpacity
                      key={v}
                      style={[ms.obsOpt, det.obs === v && { backgroundColor: OBS_COLORS[v].bg, borderColor: OBS_COLORS[v].border }]}
                      onPress={() => updateObs(i, v)}
                    >
                      <Text style={[ms.obsOptText, det.obs === v && { color: OBS_COLORS[v].text }]}>{v}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={ms.distRow}>
                  <TextInput
                    style={ms.distInput}
                    value={det.dist}
                    onChangeText={t => updateDist(i, t)}
                    keyboardType="numeric"
                    placeholder="distance"
                    placeholderTextColor="#aaa"
                  />
                  <Text style={ms.distUnit}>m</Text>
                </View>
              </View>
              <TouchableOpacity style={ms.delBtn} onPress={() => removeIndividual(i)}>
                <Text style={ms.delX}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={ms.addBtn} onPress={addIndividual}>
            <Text style={ms.addBtnText}>+ add individual</Text>
          </TouchableOpacity>
        </ScrollView>
        <View style={ms.footer}>
          <TouchableOpacity style={ms.cancelBtn} onPress={onClose}>
            <Text style={ms.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ms.saveBtn} onPress={handleSave}>
            <Text style={ms.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function CollectionScreen({ route, navigation }) {
  const { site, env } = route.params;
  const [coordIdx, setCoordIdx] = useState(0);
  const [obsData, setObsData] = useState(() => initObs(site));
  const [modalInfo, setModalInfo] = useState(null);

  const coord = site.coords[coordIdx];
  const total = site.coords.length;

  function openCell(mi, sp) {
    const dets = obsData[coordIdx][mi][sp];
    setModalInfo({ 
      mi, 
      sp, 
      dets: dets.length > 0 ? dets.map(d => ({ ...d })) : [{ obs: 'H', dist: '' }]
    });
  }

  function saveCell(mi, sp, dets) {
    setObsData(prev => {
      const next = prev.map(c => c.map(m => ({ ...m })));
      next[coordIdx][mi][sp] = dets;
      return next;
    });
  }

  function handleDone() {
    if (!hasAnyObservations(obsData, coordIdx)) {
      Alert.alert(
        'No observations recorded',
        'No observations recorded for this point. Continue anyway?',
        [
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => {
              if (coordIdx < total - 1) {
                setCoordIdx(coordIdx + 1);
              } else {
                navigation.navigate('Summary', { site, env, obsData });
              }
            }
          },
        ]
      );
      return;
    }
    if (coordIdx < total - 1) {
      setCoordIdx(coordIdx + 1);
    } else {
      navigation.navigate('Summary', { site, env, obsData });
    }
  }

  function goBack() {
    if (coordIdx > 0) setCoordIdx(coordIdx - 1);
    else navigation.goBack();
  }

  const filled = MINUTES.filter((_, mi) => SPECIES.some(sp => obsData[coordIdx][mi][sp].length > 0)).length;
  const progress = filled / MINUTES.length;

  let lastCycle = 0;
  const rows = [];
  MINUTES.forEach((m, mi) => {
    if (m.cycle !== lastCycle) {
      lastCycle = m.cycle;
      rows.push({ type: 'cycle', label: `Cycle ${m.cycle}`, key: `c${m.cycle}` });
    }
    rows.push({ type: 'minute', m, mi, key: `m${mi}` });
  });

  const headerScrollRef = useRef(null);

  const syncHeaderScroll = useCallback((event) => {
    headerScrollRef.current?.scrollTo({
      x: event.nativeEvent.contentOffset.x,
      animated: false,
    });
  }, []);

  return (
    <View style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={goBack}><Text style={s.backBtn}>← Back</Text></TouchableOpacity>
        <Text style={s.siteName}>{site.name}</Text>
      </View>

      <View style={s.coordBar}>
        <View style={s.dots}>
          {site.coords.map((_, i) => (
            <View key={i} style={[
              s.dot,
              i === coordIdx && s.dotActive,
              i !== coordIdx && allMinutesFilled(obsData, i) && s.dotDone,
            ]} />
          ))}
        </View>
        <Text style={s.coordLabel}>Point {coordIdx + 1} of {total}</Text>
        <Text style={s.coordVal}>{coord.lat.toFixed(4)}, {coord.lng.toFixed(4)}</Text>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      </View>

      <View style={s.tableHeader}>
        <View style={s.birdNameCell}>
          <Text style={s.thCell}></Text>
        </View>

        <ScrollView
          ref={headerScrollRef}
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={s.headerSpeciesRow}>
            {SPECIES.map(sp => (
              <Text key={sp} style={[s.thCell, s.thSp]}>{sp}</Text>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView style={s.tableContainer} scrollEnabled={true}>
        <View style={s.tableRow}>
          <View style={s.minuteColumn}>
            {rows.map(row => {
              if (row.type === 'cycle') {
                return (
                  <View key={row.key} style={s.cycleRow}>
                    <Text style={s.cycleLabel}>{row.label}</Text>
                  </View>
                );
              }
              const { m } = row;
              return (
                <View key={row.key} style={s.dataRow}>
                  <View style={s.minCell}>
                    <Text style={s.minNum}>Min {m.min}</Text>
                    <Text style={s.minPlaying}>{m.playing}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <ScrollView
            horizontal
            scrollEventThrottle={16}
            onScroll={syncHeaderScroll}
          >
            <View style={s.speciesColumns}>
              {rows.map(row => {
                if (row.type === 'cycle') {
                  return (
                    <View key={row.key} style={s.cycleRow}>
                      <Text style={s.cycleLabel}></Text>
                    </View>
                  );
                }
                const { m, mi } = row;
                return (
                  <View key={row.key} style={s.dataRow}>
                    {SPECIES.map(sp => {
                      const dets = obsData[coordIdx][mi][sp];
                      return (
                        <TouchableOpacity
                          key={sp}
                          style={s.spCell}
                          onPress={() => openCell(mi, sp)}
                        >
                          {dets.map((d, di) => (
                            <View key={di} style={[s.detChip, { backgroundColor: OBS_COLORS[d.obs].bg, borderColor: OBS_COLORS[d.obs].border }]}>
                              <Text style={[s.detChipText, { color: OBS_COLORS[d.obs].text }]}>
                                {d.obs}{d.dist ? ' · ' + d.dist + 'm' : ''}
                              </Text>
                            </View>
                          ))}
                          <View style={s.addChip}>
                            <Text style={s.addChipText}>+</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.doneBtn} onPress={handleDone}>
          <Text style={s.doneBtnText}>
            {coordIdx < total - 1 ? `Done with point ${coordIdx + 1} →` : 'Finish survey →'}
          </Text>
        </TouchableOpacity>
      </View>

      {modalInfo && (
        <DetectionModal
          visible={true}
          coordIdx={coordIdx}
          minuteIdx={modalInfo.mi}
          species={modalInfo.sp}
          detections={modalInfo.dets}
          onClose={() => setModalInfo(null)}
          onSave={(dets) => { saveCell(modalInfo.mi, modalInfo.sp, dets); setModalInfo(null); }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f3' },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 56, paddingBottom: 10, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#ddd' },
  backBtn: { color: '#378ADD', fontSize: 14, marginRight: 12 },
  siteName: { fontSize: 16, fontWeight: '500', color: '#1a1a1a', flex: 1 },
  coordBar: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#ddd' },
  dots: { flexDirection: 'row', gap: 5, marginBottom: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#ddd', borderWidth: 0.5, borderColor: '#ccc' },
  dotActive: { backgroundColor: '#378ADD', borderColor: '#378ADD' },
  dotDone: { backgroundColor: '#639922', borderColor: '#639922' },
  coordLabel: { fontSize: 13, fontWeight: '500', color: '#1a1a1a', marginBottom: 2 },
  coordVal: { fontSize: 12, color: '#888', marginBottom: 6 },
  progressBar: { height: 4, backgroundColor: '#eee', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: '#378ADD', borderRadius: 2 },
  tableHeader: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 4, backgroundColor: '#f5f5f3', borderBottomWidth: 0.5, borderBottomColor: '#ddd', zIndex: 10 },
  thCell: { fontSize: 11, fontWeight: '500', color: '#888', textAlign: 'center', width: 72 },
  thSp: { width: 72 },
  tableContainer: { flex: 1 },
  tableRow: { flexDirection: 'row' },
  minuteColumn: { width: 65, backgroundColor: '#fff' },
  speciesColumns: { flexDirection: 'column', paddingBottom: 100 },
  cycleRow: { backgroundColor: '#eee', paddingHorizontal: 8, paddingVertical: 3, width: 65 },
  cycleLabel: { fontSize: 11, fontWeight: '500', color: '#666' },
  dataRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#eee', paddingVertical: 4, paddingHorizontal: 4, backgroundColor: '#fff' },
  birdNameCell: { width: 65, justifyContent: 'flex-start', paddingTop: 2 },
  minCell: { width: 65, minHeight: 30, justifyContent: 'flex-start', paddingTop: 2 },
  minNum: { fontSize: 12, fontWeight: '500', color: '#333' },
  minPlaying: { fontSize: 9, color: '#999', lineHeight: 13 },
  spCell: { width: 72, alignItems: 'center', paddingHorizontal: 2, gap: 2 },
  detChip: { borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2, borderWidth: 0.5, width: '100%', alignItems: 'center' },
  detChipText: { fontSize: 10, fontWeight: '500' },
  addChip: { borderWidth: 0.5, borderColor: '#ccc', borderStyle: 'dashed', borderRadius: 4, width: '100%', alignItems: 'center', justifyContent: 'center', minHeight: 30 },
  addChipText: { fontSize: 11, color: '#aaa' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#ddd' },
  doneBtn: { backgroundColor: '#E6F1FB', borderRadius: 8, borderWidth: 0.5, borderColor: '#85B7EB', padding: 14, alignItems: 'center' },
  doneBtnText: { color: '#0C447C', fontSize: 16, fontWeight: '500' },
  headerSpeciesRow: { flexDirection: 'row' },
});

const ms = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 14, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  title: { fontSize: 18, fontWeight: '500', color: '#1a1a1a' },
  subtitle: { fontSize: 13, color: '#888', marginTop: 2 },
  scroll: { flex: 1 },
  indRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 8 },
  indNum: { fontSize: 13, fontWeight: '500', color: '#888', width: 20, paddingTop: 8 },
  obsToggle: { flexDirection: 'row', borderWidth: 0.5, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden', marginBottom: 6 },
  obsOpt: { flex: 1, alignItems: 'center', paddingVertical: 7, borderRightWidth: 0.5, borderRightColor: '#ccc' },
  obsOptText: { fontSize: 13, fontWeight: '500', color: '#888' },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  distInput: { borderWidth: 0.5, borderColor: '#ccc', borderRadius: 8, padding: 8, fontSize: 13, color: '#1a1a1a', width: 90 },
  distUnit: { fontSize: 13, color: '#888' },
  delBtn: { padding: 8 },
  delX: { fontSize: 20, color: '#ccc', fontWeight: '300' },
  addBtn: { borderWidth: 0.5, borderColor: '#85B7EB', borderRadius: 8, padding: 12, alignItems: 'center', marginTop: 4 },
  addBtnText: { color: '#378ADD', fontSize: 14, fontWeight: '500' },
  footer: { flexDirection: 'row', padding: 16, paddingBottom: 36, gap: 10, borderTopWidth: 0.5, borderTopColor: '#eee' },
  cancelBtn: { flex: 1, padding: 12, alignItems: 'center', borderWidth: 0.5, borderColor: '#ccc', borderRadius: 8 },
  cancelText: { fontSize: 15, color: '#555' },
  saveBtn: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#E6F1FB', borderWidth: 0.5, borderColor: '#85B7EB', borderRadius: 8 },
  saveText: { fontSize: 15, fontWeight: '500', color: '#0C447C' },
});
