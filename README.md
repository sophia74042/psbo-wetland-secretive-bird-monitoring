# Bird Survey App

A mobile data collection app for wetland bird surveys, built with Expo React Native.

---

## Setup (one-time, on your computer)

### 1. Install Node.js
Download from https://nodejs.org (choose the LTS version).

### 2. Install Expo CLI
Open Terminal (Mac/Linux) or Command Prompt (Windows) and run:
```
npm install -g expo-cli
```

### 3. Install dependencies
Navigate to this project folder and run:
```
cd BirdSurveyApp
npm install
```

---

## Running the app

### On your phone (easiest)
1. Install **Expo Go** from the App Store (iPhone) or Google Play (Android)
2. In the project folder, run:
   ```
   npx expo start
   ```
3. A QR code will appear in your terminal
4. **iPhone**: Open the Camera app and scan the QR code
5. **Android**: Open Expo Go and tap "Scan QR code"

The app will load on your phone. Anyone on your team can do the same — just share the QR code while your computer is running `npx expo start`.

---

## Updating site coordinates

Open `src/data/constants.js` and edit the `SITES` array. Each site has a `name` and a `coords` array of `{ lat, lng }` objects:

```js
export const SITES = [
  {
    name: 'Your Site Name',
    coords: [
      { lat: 45.1234, lng: -122.5678 },
      { lat: 45.1256, lng: -122.5690 },
    ],
  },
  // add more sites...
];
```

---

## Exporting data

After completing a survey, tap "Export CSV" on the summary screen. The app will open your phone's share sheet so you can send the file via email, AirDrop, Google Drive, etc.

The CSV is formatted for upload to the Avian Knowledge Network with columns:
`Site, Date, Temp_C, Cloud_pct, Precip, Wind, Noise, Point, Latitude, Longitude, Minute, Cycle, Playing, Species, Individual, Detection, Distance_m`

---

## Project structure

```
BirdSurveyApp/
  App.js                        # Navigation root
  src/
    data/
      constants.js              # Sites, species, minutes, options
    screens/
      SiteSetupScreen.js        # Screen 1: site + environmental data
      CollectionScreen.js       # Screen 2: per-point observation grid
      SummaryScreen.js          # Screen 3: review + CSV export
```
