export const SITES = [
  {
    name: 'Ridgefield Marsh A',
    coords: [
      { lat: 45.8123, lng: -122.4567 },
      { lat: 45.8145, lng: -122.4589 },
      { lat: 45.8167, lng: -122.4601 },
      { lat: 45.8190, lng: -122.4623 },
    ],
  },
  {
    name: 'Ridgefield Marsh B',
    coords: [
      { lat: 45.8201, lng: -122.4701 },
      { lat: 45.8223, lng: -122.4723 },
      { lat: 45.8245, lng: -122.4745 },
    ],
  },
  {
    name: 'Sauvie Island Wetlands',
    coords: [
      { lat: 45.7012, lng: -122.7834 },
      { lat: 45.7034, lng: -122.7856 },
      { lat: 45.7056, lng: -122.7878 },
      { lat: 45.7078, lng: -122.7900 },
      { lat: 45.7100, lng: -122.7922 },
    ],
  },
  {
    name: 'Tualatin River NWR',
    coords: [
      { lat: 45.3901, lng: -122.8234 },
      { lat: 45.3923, lng: -122.8256 },
      { lat: 45.3945, lng: -122.8278 },
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
  { min: 9,  cycle: 1, playing: 'PBGR ×2' },
  { min: 10, cycle: 1, playing: 'Silence' },
  { min: 11, cycle: 2, playing: 'Silence' },
  { min: 12, cycle: 2, playing: 'Silence' },
  { min: 13, cycle: 2, playing: 'Silence' },
  { min: 14, cycle: 2, playing: 'Silence' },
  { min: 15, cycle: 2, playing: 'Silence' },
  { min: 16, cycle: 2, playing: 'SORA ×3' },
  { min: 17, cycle: 2, playing: 'VIRA ×3' },
  { min: 18, cycle: 2, playing: 'AMBI ×1' },
  { min: 19, cycle: 2, playing: 'PBGR ×2' },
  { min: 20, cycle: 2, playing: 'Silence' },
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
