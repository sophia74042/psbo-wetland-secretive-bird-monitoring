export const SITES = [
  {
    name: 'KI.066 Bear Creek Wetland',
    coords: [
      { lat: 47.730183, lng: -122.070800 },
    ],
  },
  {
    name: 'KI.001 Keller Ridge Mitigation Bank',
    coords: [
      { lat: 47.678543, lng: -122.102967 },
      { lat: 47.676770, lng: -122.104530 },
      { lat: 47.678555, lng: -122.099060 },
      { lat: 47.680620, lng: -122.097630 }
    ],
  },
  {
    name: 'KI.003 Sammamish Pkway',
    coords: [
      { lat: 47.656977, lng: -122.119533 },
      { lat: 47.653825, lng: -122.115325 },
      { lat: 47.649003, lng: -122.106658 },
    ],
  },
  {
    name: 'KI.040 Soos Creek Wetland Complex',
    coords: [
      { lat: 47.429217, lng: -122.174523 },
      { lat: 47.424418, lng: -122.172140 }, 
      { lat: 47.419870, lng: -122.162290 },
      { lat: 47.412220, lng: -122.159313 },
      { lat: 47.402500, lng: -122.157222 },
      { lat: 47.398715, lng: -122.157127 },
    ],
  },
];

export const SPECIES = ['SORA', 'VIRA', 'AMBI', 'GRHE', 'PBGR', 'MAWR'];

export const MINUTES = [
  { min: 1,  cycle: 1, playing: 'Silence' },
  { min: 2,  cycle: 1, playing: 'Silence' },
  { min: 3,  cycle: 1, playing: 'Silence' },
  { min: 4,  cycle: 1, playing: 'Silence' },
  { min: 5,  cycle: 1, playing: 'Silence' },
  { min: 6,  cycle: 1, playing: 'SORA ×3' },
  { min: 7,  cycle: 1, playing: 'VIRA ×3' },
  { min: 8,  cycle: 1, playing: 'AMBI ×1' },
  { min: 9,  cycle: 1, playing: 'GRHE x3'},
  { min: 10, cycle: 1, playing: 'PBGR ×2' },
  { min: 11, cycle: 2, playing: 'Silence' },
  { min: 12, cycle: 2, playing: 'Silence' },
  { min: 13, cycle: 2, playing: 'Silence' },
  { min: 14, cycle: 2, playing: 'Silence' },
  { min: 15, cycle: 2, playing: 'Silence' },
  { min: 16, cycle: 2, playing: 'SORA ×3' },
  { min: 17, cycle: 2, playing: 'VIRA ×3' },
  { min: 18, cycle: 2, playing: 'AMBI ×1' },
  { min: 19, cycle: 2, playing: 'GRHE ×3' },
  { min: 20, cycle: 2, playing: 'PBGR ×2' },
];

export const PRECIP_OPTIONS = ['None', 'Drizzle', 'Fog', 'Mist', 'Rain', 'Snow'];
export const WIND_OPTIONS = [
  'Calm', 'Light air', 'Light breeze',
  'Gentle breeze', 'Moderate breeze', 'Too windy to survey',
];
export const NOISE_OPTIONS = ['No noise', 'Moderate noise', 'Too much noise to survey'];

export const OBS_TYPES = ['H', 'HS', 'S'];

export const OBS_COLORS = {
  H:  { bg: '#E6F1FB', text: '#0C447C', border: '#85B7EB' },
  HS: { bg: '#EAF3DE', text: '#27500A', border: '#97C459' },
  S:  { bg: '#FAEEDA', text: '#633806', border: '#EF9F27' },
};
