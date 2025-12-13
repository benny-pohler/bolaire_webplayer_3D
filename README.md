# bolaire - mosaic, floating · 3D Audio Player

An immersive web-based audio player featuring head-tracked 3D audio using fourth-order Higher-Order Ambisonics (HOA). Built on the IEM Cat3DA framework with custom UI/UX design.

## Features

- **Head-tracked 3D audio** - Camera-based head tracking for dynamic binaural spatialization
- **4th order Ambisonics** - High-resolution spatial audio (25 channels)
- **MPEG-DASH streaming** - Efficient multichannel OPUS audio delivery
- **Room ambience** - Convolution reverb with dry/wet mixing
- **Synchronized lyrics** - Auto-updating lyrics display
- **Graceful fallback** - Works as static binaural player without camera access

## Technical Stack

- **Spatial audio**: IEM Ambisonics library, 40 FPS orientation updates, OneEuroFilter smoothing
- **Head tracking**: TensorFlow.js FaceMesh (MediaPipe)
- **Streaming**: dash.js MPEG-DASH player
- **UI/UX**: Custom dark theme with dark red accents, fully accessible controls

## Audio Files

All audio files use MPEG-DASH with multichannel OPUS encoding. Place `.mpd` manifests and `.webm` segments in the `/audio` folder

### Codec Considaration
The Cat3DA player uses MPEG-DASH. The OPUS codec is chosen, as it is the only lossy codec supporting multichannel files, which is available in most browsers (not in Safari, see below). The files are packaged in the webm container for streaming via DASH. The following ffmpeg commands have proven to be effective for encoding media. Adapt the commands according to your needs.

Transcode multichannel wav audio files to multichannel OPUS in webm container, we recommend a bitrate of 64 kbit/channel/s:
```
ffmpeg \
    -i <audioInputFileName.wav> \
    -c:a libopus -mapping_family 255 -b:a 1600k -vn -f webm -dash 1 <audioOutputFileName.webm>
```

Create DASH manifest:
```
ffmpeg -f webm_dash_manifest -i <audioOutputFileName.webm> -c copy -map 0 -f webm_dash_manifest -adaptation_sets 'id=0,streams=0' manifest.mpd
```

## Browser Compatibility

**Recommended**: Chrome, Firefox, Edge (Chromium-based browsers)  
**Not supported**: Safari (lacks multichannel OPUS support), Mobile devices (requires desktop camera + computational power)

Always use the latest browser version for best performance.

## Credits

Built on the IEM Cat3DA framework by Lukas Gölles (Institute of Electronic Music and Acoustics Graz)

**Technologies**:
- [TensorFlow.js FaceMesh](https://google.github.io/mediapipe/solutions/face_mesh.html) - Head tracking
- [dash.js](https://github.com/Dash-Industry-Forum/dash.js/) - MPEG-DASH streaming
- [JSAmbisonics](https://github.com/polarch/JSAmbisonics) - Spatial audio processing
- [IEM Ambisonics library](https://plugins.iem.at/) - Binaural decoding

## License

BSD 3-Clause License
