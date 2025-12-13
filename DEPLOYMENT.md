# Bolaire 3D Audio Player - Deployment Guide

## Quick Start

1. **Upload entire `cat3da-master` folder** to your web server
2. **Access via HTTPS** (required for camera permissions) or localhost
3. **Browser compatibility:**
   - ✅ Chrome/Edge (recommended)
   - ✅ Firefox
   - ⚠️ Safari (limited - no multichannel OPUS support)

No build steps, no npm install, no user dependencies required!

---

## Features

- **Binaural 3D Audio:** 4th order ambisonics spatial audio
- **Head Tracking:** Webcam-based 3DOF tracking (desktop only)
- **Room Ambience:** 3 modes - Dry, Small room, CUBE (Large room)
- **Auto-playlist:** Tracks advance automatically, loops to first and stops
- **Responsive UI:** Works on desktop and mobile (head tracking desktop-only)

---

## File Structure

```
cat3da-master/
├── index.html              # Main player page
├── css/player.css          # Styling (black/dark red theme)
├── js/
│   ├── app.js              # Main application logic
│   ├── audio-engine.js     # Audio processing engine
│   ├── headtracking.js     # FaceMesh head tracking
│   └── OneEuroFilter.js    # Smoothing filter for tracking
├── audio/
│   ├── *.mpd               # DASH manifests
│   ├── *.webm              # Multichannel OPUS audio (25ch)
│   └── *.wav               # Impulse responses (room ambience)
├── lyrics/
│   └── *.txt               # Plain text lyrics files
├── decodingFilters/
│   └── mls_o4_*.wav        # HOA binaural decoding filters
├── dependencies/
│   ├── dash.min.js         # MPEG-DASH playback
│   ├── ambisonics.min.js   # Spatial audio decoding
│   ├── tf.min.js           # TensorFlow.js
│   ├── facemesh.js         # MediaPipe FaceMesh
│   └── three.min.js        # Math utilities
└── images/
    └── bolaire_mosaic.png  # Album artwork
```

---

## Adding Your Own Tracks

### 1. Encode Audio
Your audio must be 4th order ambisonics (25 channels) encoded as OPUS in WebM:
```bash
ffmpeg -i input.wav -c:a libopus -b:a 256k -vn output.webm
```

### 2. Create DASH Manifest
```bash
MP4Box -dash 5000 output.webm
```
This creates `output.mpd` and `output.webm`

### 3. Add to Player

**In `index.html`**, add a new track entry:
```html
<li data-track-index="4" data-src="audio/yourtrack.mpd" data-lyrics="lyrics/yourtrack.txt"
  class="player-card__track">
  <span class="player-card__track-number">05</span>
  <span class="player-card__track-title">Your Track Name</span>
  <span class="player-card__track-duration" data-track-duration>–:–</span>
</li>
```

**Create lyrics file:** `lyrics/yourtrack.txt` (plain text)

**Place files:**
- `audio/yourtrack.mpd`
- `audio/yourtrack.webm`
- `lyrics/yourtrack.txt`

Refresh page - duration loads automatically!

---

## Performance & Optimization

### Size Breakdown
- **Total:** ~202MB
  - Audio files: 189MB (4 tracks × ~35-45MB each)
  - Dependencies: 6.1MB (all minified)
  - Assets: ~7MB (filters, impulses, images)

### Memory Usage
- **Initial load:** ~50-80MB
- **Per track:** +15-20MB (streaming, not stored)
- **Head tracking:** +30-50MB (TensorFlow.js model)

### Recommendations
- Host on CDN for faster loading
- Enable gzip compression on server
- Use HTTPS for head tracking camera access
- Recommended: 100Mbps+ connection for smooth playback

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Mobile |
|---------|--------|---------|--------|--------|
| Audio Playback | ✅ | ✅ | ⚠️ | ✅ |
| Room Ambience | ✅ | ✅ | ✅ | ✅ |
| Head Tracking | ✅ | ✅ | ⚠️ | ❌ |
| Auto-advance | ✅ | ✅ | ✅ | ✅ |

**Safari limitations:**
- Multichannel OPUS not supported → Use Chrome/Firefox
- Head tracking requires manual permission grant

**Mobile:**
- Audio playback works
- Head tracking disabled (no webcam API)

---

## Troubleshooting

### No Audio
- Check browser console (F12)
- Verify HTTPS or localhost (required for some features)
- Try Chrome/Firefox instead of Safari
- Check server CORS headers allow audio file access

### Head Tracking Fails
- **"Device not found"**: Check webcam connection
- **Permission denied**: Allow camera in browser settings
- **Not supported**: Desktop browser required (no mobile)

### High Memory Usage
- Normal: TensorFlow model uses 30-50MB
- Close other tabs using camera
- Refresh page if memory grows excessively

### Tracks Don't Advance
- Check browser console for errors
- Verify all `.mpd` files reference correct `.webm` files
- Ensure `ended` event listener is working

---

## Testing

Open `test-stress.html` in browser for automated stress tests:
- Rapid track switching
- Memory leak detection
- Concurrent operations
- Error recovery
- Long session simulation

Run with Chrome flag for detailed memory: `--enable-precise-memory-info`

---

## Security & Privacy

- **Camera access:** Only requested when user enables head tracking
- **No external requests:** All assets loaded locally
- **No analytics:** No tracking, cookies, or data collection
- **HTTPS recommended:** Required for camera permissions

---

## Credits

- **Ambisonics:** JSAmbisonics library
- **DASH streaming:** dash.js
- **Head tracking:** TensorFlow.js + MediaPipe FaceMesh
- **Audio format:** OPUS codec in WebM container

---

## License

Check individual dependency licenses in `dependencies/` folder.
