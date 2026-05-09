import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Alert, useWindowDimensions,
} from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

const BIRDS = [
  {
    name: 'American Bittern',
    scientificName: 'Botaurus lentiginosus',
    code: 'AMBI',
    imageFiles: ['ambi-1.jpg', 'ambi-2.jpg', 'ambi-3.jpg', 'ambi-4.jpg'],
    audioFile: 'ambi.mp3',
    imageSources: [
      require('../assets/birds/images/ambi-1.jpg'),
      require('../assets/birds/images/ambi-2.jpg'),
      require('../assets/birds/images/ambi-3.jpg'),
      require('../assets/birds/images/ambi-4.jpg'),
    ],
    audioSource: require('../assets/birds/audio/ambi_rr.mp3'),
    notes: [
      'Stocky, striped, buffy colored',
      'About half the size of a great blue heron',
      'Tips bill up to camoflauge with reeds'
    ],
  },
  {
    name: 'Sora',
    scientificName: 'Porzana carolina',
    code: 'SORA',
    imageFiles: ['sora-1.jpg', 'sora-2.jpg', 'sora-3.jpg', 'sora-4.jpg'],
    audioFile: 'sora.mp3',
    imageSources: [
      require('../assets/birds/images/sora-1.jpg'),
      require('../assets/birds/images/sora-2.jpg'),
      require('../assets/birds/images/sora-3.jpg'),
      require('../assets/birds/images/sora-4.jpg'),
    ],
    audioSource: require('../assets/birds/audio/sora.mp3'),
    notes: [
      'Slighty larger than a robin',
      'Not a flyer -- typically scurrier and scamperer',
      'Not very curious, will often vocalize after broadcast',
      'Its "pip-pip" song sounds similar to red-winged blackbird',
    ],
  },
  {
    name: 'Virginia Rail',
    scientificName: 'Rallus limicola',
    code: 'VIRA',
    imageFiles: ['vira-1.jpg', 'vira-2.jpg', 'vira-3.jpg', 'vira-4.jpg'],
    audioFile: 'vira.mp3',
    imageSources: [
      require('../assets/birds/images/vira-1.jpg'),
      require('../assets/birds/images/vira-2.jpg'),
      require('../assets/birds/images/vira-3.jpg'),
      require('../assets/birds/images/vira-4.jpg'),
    ],
    audioSource: require('../assets/birds/audio/vira.mp3'),
    notes: [
      'Orange-red bill',
      'Very curious, responds to broadcast and may approach closely'
    ],
  },
  {
    name: 'Green Heron',
    scientificName: 'Butorides virescens',
    code: 'GRHE',
    imageFiles: ['grhe-1.jpg', 'grhe-2.jpg', 'grhe-3.jpg'],
    audioFile: 'grhe.mp3',
    imageSources: [
      require('../assets/birds/images/grhe-1.jpg'),
      require('../assets/birds/images/grhe-2.jpg'),
      require('../assets/birds/images/grhe-3.jpg'),
    ],
    audioSource: require('../assets/birds/audio/grhe.mp3'),
    notes: [
      'Rusty red front, dark back',
      'Prefers to hunt around moving water'
    ],
  },
  {
    name: 'Pied-billed Grebe',
    scientificName: 'Podilymbus podiceps',
    code: 'PBGR',
    imageFiles: ['pbgr-1.jpg', 'pbgr-2.jpg', 'pbgr-3.jpg', 'pbgr-4.jpg'],
    audioFile: 'pbgr.mp3',
    imageSources: [
      require('../assets/birds/images/pbgr-1.jpg'),
      require('../assets/birds/images/pbgr-2.jpg'),
      require('../assets/birds/images/pbgr-3.jpg'),
      require('../assets/birds/images/pbgr-4.jpg'),
    ],
    audioSource: require('../assets/birds/audio/pbgr.mp3'),
    notes: [
      'Very sensitive to broadcast, you can mute broadcast if they react poorly'
    ],
  },
  {
    name: 'Marsh Wren',
    scientificName: 'Cistothorus palustris',
    code: 'MAWR',
    imageFiles: ['mawr-1.jpg', 'mawr-2.jpg'],
    audioFile: 'mawr.mp3',
    imageSources: [
      require('../assets/birds/images/mawr-1.jpg'),
      require('../assets/birds/images/mawr-2.jpg'),
    ],
    audioSource: require('../assets/birds/audio/mawr.mp3'),
    notes: [
      'No song broadcast in survey, they\'re quite naturally chatty',
      'Tend to hang out in groups, curious'
    ],
  },
];

function formatAudioTime(seconds) {
  if (!seconds || Number.isNaN(seconds)) {
    return '0:00';
  }

  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

export default function RemindersScreen({ route, navigation }) {
  const { site, date } = route.params || {};
  const { width } = useWindowDimensions();
  const imageWidth = width - 32;
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const [activeBirdCode, setActiveBirdCode] = useState(null);
  const [currentImageIndices, setCurrentImageIndices] = useState({});

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'duckOthers',
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (status.didJustFinish) {
      setActiveBirdCode(null);
    }
  }, [status.didJustFinish]);

  useEffect(() => {
    return navigation.addListener('blur', () => {
      player.pause();
      setActiveBirdCode(null);
    });
  }, [navigation, player]);

  function continueToCollection() {
    if (!site || !date) {
      navigation.goBack();
      return;
    }
    navigation.navigate('EquipmentSetup', { site, date });
  }

  async function playAudio(bird) {
    if (!bird.audioSource) {
      Alert.alert(
        'Audio file needed',
        `Add src/assets/birds/audio/${bird.audioFile}, then wire it into audioSource in RemindersScreen.js.`
      );
      return;
    }

    if (activeBirdCode === bird.code && status.playing) {
      player.pause();
      return;
    }

    Alert.alert(
      'Do NOT play over speaker',
      'Make sure you are NOT connected to the speaker yet before playing this example call.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Play call', onPress: () => startAudio(bird) },
      ]
    );
  }

  async function startAudio(bird) {
    try {
      if (activeBirdCode === bird.code && status.isLoaded && !status.didJustFinish) {
        player.play();
        return;
      }

      player.pause();
      player.replace(bird.audioSource);
      setActiveBirdCode(bird.code);
      await player.seekTo(0);
      player.play();
    } catch (error) {
      setActiveBirdCode(null);
      Alert.alert('Audio unavailable', 'The bundled bird call could not be played on this device.');
    }
  }

  function handleImageScroll(event, bird) {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / imageWidth);
    setCurrentImageIndices(prev => ({ ...prev, [bird.code]: index }));
  }

  return (
    <View style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.heading}>Reminders</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {BIRDS.map(bird => {
          const isActiveBird = activeBirdCode === bird.code;
          const isPlayingBird = isActiveBird && status.playing;
          const currentTime = isActiveBird ? status.currentTime : 0;
          const duration = isActiveBird ? status.duration : 0;
          const progress = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

          return (
            <View key={bird.code} style={s.card}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={s.imageCarousel}
                onScroll={(event) => handleImageScroll(event, bird)}
                scrollEventThrottle={16}
              >
                {bird.imageSources.length > 0 ? (
                  bird.imageSources.map((imageSource, idx) => (
                    <Image
                      key={`${bird.code}-${idx}`}
                      source={imageSource}
                      style={[s.birdImage, { width: imageWidth }]}
                      resizeMode="cover"
                    />
                  ))
                ) : (
                  bird.imageFiles.map(imageFile => (
                    <View key={imageFile} style={[s.birdImage, s.imagePlaceholder, { width: imageWidth }]}>
                      <Text style={s.placeholderTitle}>Add image</Text>
                      <Text style={s.placeholderPath}>src/assets/birds/images/{imageFile}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
              <View style={s.imageHint}>
                <Text style={s.imageHintText}>
                  Image {(currentImageIndices[bird.code] || 0) + 1}/{bird.imageSources.length || bird.imageFiles.length}
                </Text>
              </View>

              <View style={s.cardBody}>
                <View style={s.titleRow}>
                  <View style={s.codePill}>
                    <Text style={s.codeText}>{bird.code}</Text>
                  </View>
                  <View style={s.nameBlock}>
                    <Text style={s.birdName}>{bird.name}</Text>
                    <Text style={s.scientificName}>{bird.scientificName}</Text>
                  </View>
                </View>

                <View style={s.audioBlock}>
                  <Text style={s.audioLabel}>Example call recording</Text>
                  <View style={s.audioPlayer}>
                    <TouchableOpacity
                      style={s.playPauseBtn}
                      onPress={() => playAudio(bird)}
                      accessibilityRole="button"
                      accessibilityLabel={isPlayingBird ? 'Pause example call' : 'Play example call'}
                    >
                      <Text style={s.playPauseIcon}>{isPlayingBird ? 'Ⅱ' : '▶'}</Text>
                    </TouchableOpacity>

                    <View style={s.progressBlock}>
                      <View style={s.progressTrack}>
                        <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
                      </View>
                      <Text style={s.progressTime}>
                        {formatAudioTime(currentTime)} / {formatAudioTime(duration)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={s.notesBlock}>
                  {bird.notes.map(note => (
                    <View key={note} style={s.noteRow}>
                      <Text style={s.noteBullet}>•</Text>
                      <Text style={s.noteText}>{note}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity style={s.continueBtn} onPress={continueToCollection}>
          <Text style={s.continueBtnText}>Continue to survey →</Text>
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
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 118 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#ddd',
    marginBottom: 14,
    overflow: 'hidden',
  },
  imageCarousel: { backgroundColor: '#e8e8e2' },
  birdImage: { height: 190, backgroundColor: '#e8e8e2' },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  placeholderTitle: { fontSize: 14, color: '#555', fontWeight: '500', marginBottom: 4 },
  placeholderPath: { fontSize: 12, color: '#888', textAlign: 'center' },
  imageHint: {
    paddingHorizontal: 14,
    paddingTop: 7,
    paddingBottom: 2,
    backgroundColor: '#fff',
  },
  imageHintText: { fontSize: 10, color: '#999' },
  cardBody: { padding: 14 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  codePill: {
    width: 48,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E6F1FB',
    borderWidth: 0.5,
    borderColor: '#85B7EB',
    marginRight: 10,
  },
  codeText: { color: '#0C447C', fontSize: 12, fontWeight: '600' },
  nameBlock: { flex: 1 },
  birdName: { fontSize: 17, fontWeight: '500', color: '#1a1a1a' },
  scientificName: { fontSize: 12, color: '#777', marginTop: 1, fontStyle: 'italic' },
  audioBlock: { marginBottom: 12 },
  audioLabel: {
    marginBottom: 6,
    color: '#555',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playPauseBtn: {
    width: 62,
    height: 38,
    borderWidth: 0.5,
    borderColor: '#85B7EB',
    borderRadius: 8,
    backgroundColor: '#E6F1FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  playPauseIcon: { color: '#0C447C', fontSize: 18, fontWeight: '600', lineHeight: 20 },
  progressBlock: { flex: 1 },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e8e8e2',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#378ADD',
  },
  progressTime: { marginTop: 4, color: '#777', fontSize: 11 },
  notesBlock: { marginTop: 2 },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 5 },
  noteBullet: { width: 14, color: '#555', fontSize: 13, lineHeight: 18 },
  noteText: { flex: 1, color: '#555', fontSize: 13, lineHeight: 18 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
  },
  continueBtn: {
    backgroundColor: '#E6F1FB',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#85B7EB',
    padding: 14,
    alignItems: 'center',
  },
  continueBtnText: { color: '#0C447C', fontSize: 16, fontWeight: '500' },
});
