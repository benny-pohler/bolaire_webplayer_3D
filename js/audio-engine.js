"use strict";

(function () {
  const DEFAULT_HOA_ORDER = 4;
  const DEFAULT_FILTERS_BASE = "./decodingFilters/";
  const DEFAULT_OUTPUT_GAIN = 0.42;
  const REVERB_OUTPUT_GAIN = 0.90;
  const SPATIALIZATION_UPDATE_MS = 25; // 40 FPS = 25ms interval (IEM approach)

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  class BolaireAudioEngine {
    constructor(options) {
      if (!window.dashjs) {
        throw new Error("dash.js is required but missing. Make sure dependencies/dash.min.js is loaded before audio-engine.js");
      }
      if (!window.ambisonics) {
        throw new Error("ambisonics library missing. Include dependencies/ambisonics.min.js before audio-engine.js");
      }

      const config = Object.assign(
        {
          order: DEFAULT_HOA_ORDER,
          filtersBasePath: DEFAULT_FILTERS_BASE,
          outputGain: DEFAULT_OUTPUT_GAIN,
          tracks: [],
          audioElementId: "player-audio",
          reverbImpulse: null
        },
        options || {}
      );

      if (!Array.isArray(config.tracks) || config.tracks.length === 0) {
        throw new Error("BolaireAudioEngine requires a non-empty tracks array");
      }

      this.tracks = config.tracks;
      this.order = config.order;
      this.channelCount = (this.order + 1) * (this.order + 1);
      this.filtersBasePath = config.filtersBasePath;
      this.outputGainTarget = config.outputGain;

      const audioElement = document.getElementById(config.audioElementId);
      if (!audioElement) {
        throw new Error(`Audio element with id \"${config.audioElementId}\" not found.`);
      }

      audioElement.crossOrigin = "anonymous";
      audioElement.preload = "auto";
      this.audioElement = audioElement;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        throw new Error("Web Audio API is not supported in this browser");
      }

      this.context = new AudioCtx();
      
      // IEM pattern: Expose context globally for ambisonics library
      window.context = this.context;
      
      this.player = dashjs.MediaPlayer().create();
      this.player.updateSettings({
        streaming: {
          lowLatencyEnabled: false,
          abr: {
            autoSwitchBitrate: {
              audio: false
            }
          }
        }
      });
      this.player.initialize(this.audioElement, null, false);

      this.sourceNode = this.context.createMediaElementSource(this.audioElement);
      this.sourceNode.channelCountMode = "explicit";
      this.sourceNode.channelCount = this.channelCount;
      this.sourceNode.channelInterpretation = "discrete";

      this.sceneRotator = new ambisonics.sceneRotator(this.context, this.order);
      this.binauralDecoder = new ambisonics.binDecoder(this.context, this.order);
      
      // Workaround for ambisonics library bug - make context globally accessible
      if (this.sceneRotator && !this.sceneRotator.ctx) {
        this.sceneRotator.ctx = this.context;
      }

      this.outputGain = this.context.createGain();
      this.outputGain.gain.value = this.outputGainTarget;

      // Dry/wet mix for reverb
      this.dryGain = this.context.createGain();
      this.dryGain.gain.value = 1.0; // 100% dry signal
      
      this.wetGain = this.context.createGain();
      this.wetGain.gain.value = 1.90; // 10% wet reverb (subtle room ambience)
      
      this.reverbGain = this.context.createGain();
      this.reverbGain.gain.value = REVERB_OUTPUT_GAIN;

      this.sourceNode.connect(this.sceneRotator.in);
      this.sceneRotator.out.connect(this.binauralDecoder.in);
      this.binauralDecoder.out.connect(this.outputGain);
      
      // Initial routing: outputGain → dryGain → destination
      this.outputGain.connect(this.dryGain);
      this.dryGain.connect(this.context.destination);

      this.currentTrackIndex = 0;
      this.filtersLoaded = false;
      this.convolver = null;
      this.reverbImpulse = config.reverbImpulse || null;
      
      // IEM-style orientation smoothing with OneEuroFilter
      // Optimized for lower latency: higher beta = faster response
      const filterFreq = 120; // 40 FPS update rate
      this.orientationFilters = {
        yaw: new OneEuroFilter(filterFreq, 1.5, 0.02, 0.3),
        pitch: new OneEuroFilter(filterFreq, 1.5, 0.02, 0.3),
        roll: new OneEuroFilter(filterFreq, 1.5, 0.02, 0.3)
      };
      this.filterTime = 0;
      this.filterCount = 0;
      
      // Current raw orientation values
      this.rawOrientation = { yaw: 0, pitch: 0, roll: 0 };
      
      // Start spatial update interval (IEM approach)
      this.spatialUpdateInterval = null;
    }

    async init() {
      if (this.reverbImpulse) {
        try {
          await this.setReverbImpulse(this.reverbImpulse);
        } catch (err) {
          console.warn("Initial reverb impulse failed to load", err);
          this._ensureDirectOutput();
        }
      }
      await this._loadFilters();
      
      // Preload track durations in background (non-blocking)
      this.preloadTrackDurations().catch(err => {
        console.warn("Duration preload failed", err);
      });
    }

    async preloadTrackDurations() {
      for (let i = 0; i < this.tracks.length; i++) {
        try {
          const track = this.tracks[i];
          const response = await fetch(track.src);
          if (!response.ok) continue;
          
          const text = await response.text();
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(text, "text/xml");
          
          const durationAttr = xmlDoc.querySelector("MPD")?.getAttribute("mediaPresentationDuration");
          if (durationAttr) {
            const seconds = this._parseDuration(durationAttr);
            if (Number.isFinite(seconds)) {
              track.durationSeconds = seconds;
              // Update UI immediately when duration is loaded
              if (track.durationDisplay) {
                const mins = Math.floor(seconds / 60);
                const secs = Math.floor(seconds % 60);
                track.durationDisplay.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
              }
            }
          }
        } catch (err) {
          console.warn(`Failed to preload duration for track ${i}`, err);
        }
      }
    }

    _parseDuration(isoDuration) {
      const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+\.?\d*S)?/);
      if (!match) return 0;
      
      const hours = match[1] ? parseInt(match[1]) : 0;
      const minutes = match[2] ? parseInt(match[2]) : 0;
      const seconds = match[3] ? parseFloat(match[3]) : 0;
      
      return hours * 3600 + minutes * 60 + seconds;
    }

    async _loadFilters() {
      return new Promise((resolve, reject) => {
        try {
          const filterFile = `${this.filtersBasePath}mls_o${this.order}.wav`;
          const loader = new ambisonics.HOAloader(
            this.context,
            this.order,
            filterFile,
            (buffer) => {
              // IEM pattern: Use updateFilters() not load()
              this.binauralDecoder.updateFilters(buffer);
              this.filtersLoaded = true;
              resolve();
            }
          );
          loader.load();
        } catch (err) {
          reject(err);
        }
      });
    }

    _ensureDirectOutput() {
      try {
        this.outputGain.disconnect();
        this.dryGain.disconnect();
        this.wetGain.disconnect();
      } catch (err) {
        // no-op if already disconnected
      }

      if (this.convolver) {
        try {
          this.convolver.disconnect();
        } catch (err) {
          // ignore
        }
      }

      // Direct routing: outputGain → dryGain → destination
      this.outputGain.connect(this.dryGain);
      this.dryGain.connect(this.context.destination);
    }

    async ensureContext() {
      if (this.context.state !== "running") {
        try {
          await this.context.resume();
        } catch (err) {
          console.warn("Audio context resume was blocked", err);
        }
      }
    }

    async loadTrack(index) {
      if (index < 0 || index >= this.tracks.length) {
        throw new RangeError("Track index out of bounds");
      }
      this.currentTrackIndex = index;
      const track = this.tracks[index];
      this.audioElement.pause();
      this.audioElement.currentTime = 0;

      await this.ensureContext();

      return new Promise((resolve, reject) => {
        const cleanup = () => {
          this.audioElement.removeEventListener("loadedmetadata", onMetadata);
          this.audioElement.removeEventListener("canplay", onCanPlay);
          this.audioElement.removeEventListener("error", onError);
          clearTimeout(timeoutId);
        };

        const onMetadata = () => {
          cleanup();
          resolve(track);
        };

        const onCanPlay = () => {
          cleanup();
          resolve(track);
        };

        const onError = (event) => {
          cleanup();
          const error = event?.error || new Error("Unknown audio element error");
          reject(error);
        };

        const timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error("Timed out while waiting for track metadata"));
        }, 10000);

        this.audioElement.addEventListener("loadedmetadata", onMetadata, { once: true });
        this.audioElement.addEventListener("canplay", onCanPlay, { once: true });
        this.audioElement.addEventListener("error", onError, { once: true });

        try {
          // dash.js automatically handles switching between sources
          this.player.attachSource(track.src);
        } catch (err) {
          cleanup();
          reject(err);
        }
      });
    }

    async play() {
      await this.ensureContext();
      
      if (!this.filtersLoaded) {
        await this._loadFilters();
      }
      
      return this.audioElement.play();
    }

    pause() {
      this.audioElement.pause();
    }

    togglePlayback() {
      if (this.audioElement.paused) {
        return this.play();
      }
      this.pause();
      return Promise.resolve();
    }

    seek(seconds) {
      if (!Number.isFinite(seconds)) return;
      const duration = this.audioElement.duration;
      if (Number.isFinite(duration)) {
        this.audioElement.currentTime = clamp(seconds, 0, duration);
      }
    }

    getCurrentTrack() {
      return Object.assign({ index: this.currentTrackIndex }, this.tracks[this.currentTrackIndex]);
    }

    setOrientation({ yaw = 0, pitch = 0, roll = 0 } = {}) {
      // IEM approach: Just store raw values, let interval handle filtering and updates
      this.rawOrientation.yaw = yaw;
      this.rawOrientation.pitch = pitch;
      this.rawOrientation.roll = roll;
    }
    
    _updateSpatialAudio() {
      if (!this.sceneRotator || !this.filtersLoaded) {
        return;
      }
      
      // Option 1: No filter (instant, might be jittery) - uncomment to test
      // this.sceneRotator.yaw = -this.rawOrientation.yaw;
      // this.sceneRotator.pitch = this.rawOrientation.pitch;
      // this.sceneRotator.roll = this.rawOrientation.roll;
      
      // Option 2: OneEuroFilter (current - already faster than IEM)
      this.filterTime = (1.0 / 40) * this.filterCount;
      this.filterCount++;
      
      const smoothYaw = this.orientationFilters.yaw.filter(this.rawOrientation.yaw, this.filterTime);
      const smoothPitch = this.orientationFilters.pitch.filter(this.rawOrientation.pitch, this.filterTime);
      const smoothRoll = this.orientationFilters.roll.filter(this.rawOrientation.roll, this.filterTime);
      
      this.sceneRotator.yaw = -smoothYaw;
      this.sceneRotator.pitch = smoothPitch;
      this.sceneRotator.roll = smoothRoll;
      
      this.sceneRotator.updateRotMtx();
    }
    
    startSpatialUpdates() {
      if (this.spatialUpdateInterval) return;
      
      // IEM approach: 40 FPS update interval
      this.spatialUpdateInterval = setInterval(() => {
        this._updateSpatialAudio();
      }, SPATIALIZATION_UPDATE_MS);
    }
    
    stopSpatialUpdates() {
      if (this.spatialUpdateInterval) {
        clearInterval(this.spatialUpdateInterval);
        this.spatialUpdateInterval = null;
      }
      
      // Reset filters
      this.orientationFilters.yaw.reset();
      this.orientationFilters.pitch.reset();
      this.orientationFilters.roll.reset();
      this.filterCount = 0;
    }

    resetOrientation() {
      // Reset raw orientation
      this.setOrientation({ yaw: 0, pitch: 0, roll: 0 });
      
      // Force immediate update to center position
      if (this.sceneRotator) {
        this.sceneRotator.yaw = 0;
        this.sceneRotator.pitch = 0;
        this.sceneRotator.roll = 0;
        this.sceneRotator.updateRotMtx();
      }
    }

    async setReverbImpulse(impulseUrl) {
      if (!impulseUrl) {
        this._ensureDirectOutput();
        this.reverbImpulse = null;
        return;
      }

      try {
        const response = await fetch(impulseUrl);
        if (!response.ok) {
          throw new Error(`Failed to load impulse response: HTTP ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

        if (!this.convolver) {
          this.convolver = this.context.createConvolver();
        }

        this.convolver.buffer = audioBuffer;
        this.convolver.normalize = true;

        // Disconnect existing routing
        try {
          this.outputGain.disconnect();
        } catch (err) {}
        
        try {
          this.dryGain.disconnect();
        } catch (err) {}
        
        try {
          this.wetGain.disconnect();
        } catch (err) {}
        
        if (this.convolver) {
          try {
            this.convolver.disconnect();
          } catch (err) {}
        }

        // Parallel dry/wet routing for natural reverb
        // Dry path: outputGain → dryGain → destination
        this.outputGain.connect(this.dryGain);
        this.dryGain.connect(this.context.destination);
        
        // Wet path: outputGain → convolver → wetGain → reverbGain → destination
        this.outputGain.connect(this.convolver);
        this.convolver.connect(this.wetGain);
        this.wetGain.connect(this.reverbGain);
        this.reverbGain.connect(this.context.destination);
        
        this.reverbImpulse = impulseUrl;
      } catch (err) {
        console.error("Failed to load reverb impulse", err);
        this._ensureDirectOutput();
        throw err;
      }
    }

    destroy() {
      this.stopSpatialUpdates();
      this.stop();
      if (this.player) {
        this.player.reset();
        this.player = null;
      } 
      try {
        this.sceneRotator?.out?.disconnect();
        this.binauralDecoder?.out?.disconnect();
        this.outputGain?.disconnect();
        this.dryGain?.disconnect();
        this.wetGain?.disconnect();
        this.reverbGain?.disconnect();
        if (this.convolver) {
          this.convolver.disconnect();
        }
      } catch (err) {
        console.warn("Error disconnecting audio graph", err);
      }

      if (this.context && this.context.state !== "closed") {
        this.context.close();
      }
    }
  }

  window.BolaireAudioEngine = BolaireAudioEngine;
})();
