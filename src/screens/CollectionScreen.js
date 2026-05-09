import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Alert, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { SPECIES, MINUTES, OBS_TYPES, OBS_COLORS } from '../data/constants';

const SURVEY_AUDIO_SOURCE = require('../assets/birds/audio/5minSilence-SORA-VIRA-AMBI-GRHE-PBGR-stop.mp3');
const EMPTY_MINUTE_ROW_HEIGHT = 42;
const DETECTION_CHIP_ROW_HEIGHT = 22;

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

function formatAudioTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) {
    return '0:00';
  }

  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function getMinuteRowHeight(obsData, coordIdx, minuteIdx) {
  const maxDetections = Math.max(
    0,
    ...SPECIES.map(sp => obsData[coordIdx][minuteIdx][sp].length)
  );

  return EMPTY_MINUTE_ROW_HEIGHT + maxDetections * DETECTION_CHIP_ROW_HEIGHT;
}

function DetectionModal({ visible, coordIdx, minuteIdx, species, detections, onClose, onSave, landmarks }) {
  const [localDets, setLocalDets] = useState(() => detections.map(d => ({ ...d })));

  function addIndividual() {
    setLocalDets(prev => [...prev, { obs: 'H', dist: '', notes: '' }]);
  }

  function updateObs(i, obs) {
    setLocalDets(prev => prev.map((d, idx) => idx === i ? { ...d, obs } : d));
  }

  function updateDist(i, dist) {
    setLocalDets(prev => prev.map((d, idx) => idx === i ? { ...d, dist } : d));
  }

  function updateNotes(i, notes) {
    setLocalDets(prev => prev.map((d, idx) => idx === i ? { ...d, notes } : d));
  }

  function removeIndividual(i) {
    setLocalDets(prev => prev.filter((_, idx) => idx !== i));
  }

  function handleSave() {
    // Validate that all detections have a distance
    const missingDistance = localDets.some(d => !d.dist || !d.dist.trim());
    if (missingDistance) {
      Alert.alert(
        'Missing distance',
        'Please enter a distance for all recorded individuals.'
      );
      return;
    }
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
          {landmarks[coordIdx] && landmarks[coordIdx].length > 0 && (
            <View style={ms.landmarksReminder}>
              <Text style={ms.landmarksTitle}>Reference landmarks:</Text>
              {landmarks[coordIdx].map((landmark, li) => (
                <View key={li} style={ms.landmarkLine}>
                  <Text style={ms.landmarkText}>{landmark.name}</Text>
                  <Text style={ms.landmarkDist}>{landmark.distance}m</Text>
                </View>
              ))}
            </View>
          )}
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
                
                <TextInput
                  style={ms.notesInput}
                  value={det.notes}
                  onChangeText={t => updateNotes(i, t)}
                  placeholder="notes"
                  placeholderTextColor="#aaa"
                  multiline
                  textAlignVertical="top"
                />
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
  const { site, env = {}, landmarks = {}, environmentData = {}, obsData: initialObsData, coordIdx: initialCoordIdx } = route.params;
  const [coordIdx, setCoordIdx] = useState(initialCoordIdx);
  const [obsData, setObsData] = useState(() => initialObsData || initObs(site));
  const [modalInfo, setModalInfo] = useState(null);
  const [broadcastLoaded, setBroadcastLoaded] = useState(false);
  const [broadcastMuted, setBroadcastMuted] = useState(false);
  const [broadcastCycle, setBroadcastCycle] = useState(1);
  const [lastFinishedCycle, setLastFinishedCycle] = useState(null);
  const finishHandlingRef = useRef(false);
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const coord = site.coords[coordIdx];
  const total = site.coords.length;
  const audioDuration = status.duration || 0;
  const audioCurrentTime = broadcastLoaded ? status.currentTime : 0;
  const audioProgress = audioDuration > 0 ? Math.min(audioCurrentTime / audioDuration, 1) : 0;

  const stopBroadcast = useCallback(async () => {
    player.pause();
    setBroadcastLoaded(false);
    try {
      await player.seekTo(0);
    } catch (error) {
      // The player may not have a source loaded yet.
    }
  }, [player]);

  useEffect(() => {
    if (status.didJustFinish && !finishHandlingRef.current) {
      finishHandlingRef.current = true;
      
      if (broadcastCycle === 1) {
        Alert.alert(
          'Cycle 1 complete',
          'Play the survey broadcast recording again to start cycle 2'
        );
        setBroadcastCycle(2);
        setLastFinishedCycle(1);
        stopBroadcast();
        setBroadcastLoaded(false);
      } else if (broadcastCycle === 2) {
        const isLastPoint = coordIdx === total - 1;
        Alert.alert(
          'Survey complete at point',
          isLastPoint
            ? `You've completed the survey at Point ${coordIdx + 1}! Finalize your observations and press 'Finish survey'.`
            : `You've completed the survey at Point ${coordIdx + 1}! Finalize your observations and continue to the next point.`
        );
        setLastFinishedCycle(2);
        stopBroadcast();
      }
    } else if (!status.didJustFinish) {
      finishHandlingRef.current = false;
    }
  }, [status.didJustFinish, broadcastCycle, coordIdx, total, stopBroadcast]);

  useEffect(() => {
    return navigation.addListener('blur', stopBroadcast);
  }, [navigation, stopBroadcast]);

  useEffect(() => {
    player.muted = broadcastMuted;
  }, [player, broadcastMuted]);

  function openCell(mi, sp) {
    const dets = obsData[coordIdx][mi][sp];
    setModalInfo({ 
      mi, 
      sp, 
      dets: dets.length > 0 ? dets.map(d => ({ notes: '', ...d })) : [{ obs: 'H', dist: '', notes: '' }]
    });
  }

  function saveCell(mi, sp, dets) {
    setObsData(prev => {
      const next = prev.map(c => c.map(m => ({ ...m })));
      next[coordIdx][mi][sp] = dets;
      return next;
    });
  }

  async function toggleBroadcast() {
    try {
      if (status.playing) {
        player.pause();
        return;
      }

      if (broadcastLoaded && status.isLoaded && !status.didJustFinish) {
        player.play();
        return;
      }

      player.replace(SURVEY_AUDIO_SOURCE);
      setBroadcastLoaded(true);
      await player.seekTo(0);
      player.play();
    } catch (error) {
      setBroadcastLoaded(false);
      Alert.alert('Audio unavailable', 'The survey broadcast recording could not be played on this device.');
    }
  }

  function toggleBroadcastMute() {
    setBroadcastMuted(prev => !prev);
  }

  // TODO: Remove these skip functions and buttons after testing
  async function skipBackward() {
    try {
      const newTime = Math.max(0, audioCurrentTime - 10);
      await player.seekTo(newTime);
    } catch (error) {
      console.error('Error skipping backward:', error);
    }
  }

  async function skipForward() {
    try {
      const newTime = Math.min(audioDuration, audioCurrentTime + 10);
      await player.seekTo(newTime);
    } catch (error) {
      console.error('Error skipping forward:', error);
    }
  }

  function advancePointOrFinish() {
    stopBroadcast();
    if (coordIdx < total - 1) {
      navigation.push('SurveyPointSetup', { site, env, obsData, environmentData, coordIdx: coordIdx + 1 });
    } else {
      navigation.navigate('Summary', { site, env, obsData, environmentData });
    }
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
            onPress: advancePointOrFinish
          },
        ]
      );
      return;
    }
    advancePointOrFinish();
  }

  function goBack() {
    Alert.alert(
        'Are you sure you want to go back?',
        'The data you\'ve recorded at this site will be lost.',
        [
          { text: 'Cancel', onPress: () => {}, style: 'cancel' },
          { 
            text: 'Continue', 
            onPress: () => {
              stopBroadcast();
              navigation.goBack();
            }
          },
        ]
      );
  }

  const filled = MINUTES.filter((_, mi) => SPECIES.some(sp => obsData[coordIdx][mi][sp].length > 0)).length;
  const progress = filled / MINUTES.length;
  const minuteRowHeights = MINUTES.map((_, mi) => getMinuteRowHeight(obsData, coordIdx, mi));

  // Calculate which minute should be highlighted based on playback time and cycle
  const elapsedMinutes = Math.floor(audioCurrentTime / 60);
  let highlightedMin = null;
  if (broadcastLoaded && broadcastCycle === 1) {
    highlightedMin = elapsedMinutes + 1;
  } else if (broadcastLoaded && broadcastCycle === 2) {
    highlightedMin = elapsedMinutes + 11;
  }

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

      <View style={s.broadcastBar}>
        <Text style={s.broadcastLabel}>Survey broadcast recording</Text>
        <View style={s.broadcastPlayer}>
          <TouchableOpacity
            style={s.playPauseBtn}
            onPress={toggleBroadcast}
            accessibilityRole="button"
            accessibilityLabel={status.playing ? 'Pause survey broadcast' : 'Play survey broadcast'}
          >
            <Text style={s.playPauseIcon}>{status.playing ? 'Ⅱ' : '▶'}</Text>
          </TouchableOpacity>
          
          {/* TODO: Remove skip buttons after testing */}
          <TouchableOpacity
            style={s.skipBtn}
            onPress={skipBackward}
            accessibilityRole="button"
            accessibilityLabel="Skip back 10 seconds"
          >
            <Text style={s.skipBtnText}>⏮ -10s</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={s.skipBtn}
            onPress={skipForward}
            accessibilityRole="button"
            accessibilityLabel="Skip forward 10 seconds"
          >
            <Text style={s.skipBtnText}>+10s ⏭</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[s.muteBtn, broadcastMuted && s.muteBtnActive]}
            onPress={toggleBroadcastMute}
            accessibilityRole="button"
            accessibilityLabel={broadcastMuted ? 'Unmute survey broadcast' : 'Mute survey broadcast'}
          >
            <Text style={[s.muteBtnText, broadcastMuted && s.muteBtnTextActive]}>
              {broadcastMuted ? 'Muted' : 'Mute'}
            </Text>
          </TouchableOpacity>
          <View style={s.audioProgressBlock}>
            <View style={s.audioProgressTrack}>
              <View style={[s.audioProgressFill, { width: `${audioProgress * 100}%` }]} />
            </View>
            <Text style={s.audioProgressTime}>
              {formatAudioTime(audioCurrentTime)} / {formatAudioTime(audioDuration)}
            </Text>
          </View>
        </View>
        <View style={s.cycleToggle}>
          {[1, 2].map(cycle => (
            <View
              key={cycle}
              style={[s.cycleToggleBtn, broadcastCycle === cycle && s.cycleToggleBtnActive]}
            >
              <Text style={[s.cycleToggleText, broadcastCycle === cycle && s.cycleToggleTextActive]}>
                Cycle {cycle}
              </Text>
            </View>
          ))}
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
              const { m, mi } = row;
              const isHighlighted = highlightedMin === m.min;
              return (
                <View key={row.key} style={[s.dataRow, isHighlighted && s.dataRowHighlighted, { minHeight: minuteRowHeights[mi] }]}>
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
            bounces={false}
            overScrollMode="never"
          >
            <View style={s.speciesColumns}>
              {rows.map(row => {
                if (row.type === 'cycle') {
                  return (
                    <View key={row.key} style={[s.dataRow, { backgroundColor: '#eee' }]}>
                      {SPECIES.map(sp => (
                        <View key={sp} style={[s.spCell, {minHeight: 12.75 }]} />
                      ))}
                    </View>
                  );
                }
                const { m, mi } = row;
                const isHighlighted = highlightedMin === m.min;
                return (
                  <View key={row.key} style={[s.dataRow, isHighlighted && s.dataRowHighlighted, { minHeight: minuteRowHeights[mi] }]}>
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
                                {d.obs}
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
          landmarks={landmarks}
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
  broadcastBar: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#ddd' },
  broadcastLabel: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 6, textTransform: 'uppercase' },
  broadcastPlayer: { flexDirection: 'row', alignItems: 'center' },
  playPauseBtn: {
    width: 42,
    height: 36,
    borderWidth: 0.5,
    borderColor: '#85B7EB',
    borderRadius: 8,
    backgroundColor: '#E6F1FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  playPauseIcon: { color: '#0C447C', fontSize: 18, fontWeight: '600', lineHeight: 20 },
  // TODO: Remove skipBtn styles after testing
  skipBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: { fontSize: 11, fontWeight: '500', color: '#555' },
  muteBtn: {
    width: 58,
    height: 36,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  muteBtnActive: { backgroundColor: '#FAEEDA', borderColor: '#EF9F27' },
  muteBtnText: { color: '#555', fontSize: 12, fontWeight: '600' },
  muteBtnTextActive: { color: '#633806' },
  audioProgressBlock: { flex: 1 },
  audioProgressTrack: { height: 8, borderRadius: 4, backgroundColor: '#e8e8e2', overflow: 'hidden' },
  audioProgressFill: { height: '100%', borderRadius: 4, backgroundColor: '#378ADD' },
  audioProgressTime: { marginTop: 4, fontSize: 11, color: '#777' },
  cycleToggle: {
    flexDirection: 'row',
    marginTop: 10,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fafafa',
  },
  cycleToggleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRightWidth: 0.5,
    borderRightColor: '#ccc',
  },
  cycleToggleBtnActive: { backgroundColor: '#E6F1FB' },
  cycleToggleText: { fontSize: 13, fontWeight: '500', color: '#555' },
  cycleToggleTextActive: { color: '#0C447C' },
  tableHeader: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 4, backgroundColor: '#f5f5f3', borderBottomWidth: 0.5, borderBottomColor: '#ddd', zIndex: 10 },
  thCell: { fontSize: 11, fontWeight: '500', color: '#888', textAlign: 'center', width: 72 },
  thSp: { width: 72 },
  tableContainer: { flex: 1 },
  tableRow: { flexDirection: 'row' },
  minuteColumn: { width: 65, backgroundColor: '#fff' },
  speciesColumns: { flexDirection: 'column', paddingBottom: 100 },
  cycleRow: { backgroundColor: '#eee', paddingHorizontal: 8, paddingVertical: 4, width: 65 },
  cycleLabel: { fontSize: 11, fontWeight: '500', color: '#666' },
  dataRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#eee', paddingVertical: 4, paddingHorizontal: 4, backgroundColor: '#fff' },
  dataRowHighlighted: { backgroundColor: '#FFF8E1' },
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
  landmarksReminder: {
    backgroundColor: '#f0f7ff',
    borderWidth: 0.5,
    borderColor: '#d4e6f7',
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
  },
  landmarksTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a5490',
    marginBottom: 6,
  },
  landmarkLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0ecf8',
  },
  landmarkText: {
    fontSize: 11,
    color: '#1a5490',
    flex: 1,
  },
  landmarkDist: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1a5490',
    marginLeft: 8,
  },
  notesInput: {
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    fontSize: 13,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
    minHeight: 64,
    marginTop: 8,
  },
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
