Bird Reminder Assets
====================

Put bird photos in:

  src/assets/birds/images/

Put bird call audio files in:

  src/assets/birds/audio/

Use these filenames so each file maps clearly to the correct card:

| Bird | Image filenames | Audio filename |
| --- | --- | --- |
| American Bittern | ambi-1.jpg, ambi-2.jpg, ambi-3.jpg | ambi.mp3 |
| Sora | sora-1.jpg, sora-2.jpg, sora-3.jpg | sora.mp3 |
| Virginia Rail | vira-1.jpg, vira-2.jpg, vira-3.jpg | vira.mp3 |
| Green Heron | grhe-1.jpg, grhe-2.jpg, grhe-3.jpg | grhe.mp3 |
| Pied-billed Grebe | pbgr-1.jpg, pbgr-2.jpg, pbgr-3.jpg | pbgr.mp3 |
| Marsh Wren | mawr-1.jpg, mawr-2.jpg, mawr-3.jpg | mawr.mp3 |

Recommended formats:

- Images: `.jpg`, landscape or square, around 1200px wide.
- Audio: `.mp3`, short example clips.

You can add more than three images. Keep the same pattern and continue the
numbering, for example `sora-4.jpg` and `sora-5.jpg`.

After adding the files, update the `imageSources` and `audioSource` fields in
`src/screens/RemindersScreen.js` from empty/null values to matching static
`require` calls. React Native needs static `require(...)` calls for bundled app
assets.

Example:

```js
imageSources: [
  require('../assets/birds/images/ambi-1.jpg'),
  require('../assets/birds/images/ambi-2.jpg'),
  require('../assets/birds/images/ambi-3.jpg'),
],
audioSource: require('../assets/birds/audio/ambi.mp3'),
```
