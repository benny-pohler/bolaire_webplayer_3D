"use strict";

(function () {
  const DEG_LIMIT = 75;
  const CONFIDENCE_THRESHOLD = 0.35;

  function radiansToDegrees(rad) {
    return rad * (180 / Math.PI);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  class HeadTrackingController {
    constructor(options) {
      const config = Object.assign(
        {
          videoElementId: "headtrack-video",
          canvasElementId: "headtrack-canvas",
          onOrientation: () => {}
        },
        options || {}
      );

      this.video = document.getElementById(config.videoElementId);
      this.canvas = document.getElementById(config.canvasElementId);
      this.onOrientation = typeof config.onOrientation === "function" ? config.onOrientation : () => {};

      if (!this.video) {
        throw new Error(`HeadTrackingController: video element '${config.videoElementId}' not found`);
      }

      if (!this.canvas) {
        throw new Error(`HeadTrackingController: canvas element '${config.canvasElementId}' not found`);
      }

      this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
      this.stream = null;
      this.model = null;
      this.enabled = false;
      this.frameRequest = null;
      this.filters = null;
      this.lastTimestamp = 0;
      this._tfReady = false;
      this._pendingEnable = null;
    }

    static isSupported() {
      return Boolean(navigator.mediaDevices?.getUserMedia) && typeof window.facemesh !== "undefined" && typeof window.THREE !== "undefined";
    }

    async enable() {
      if (!HeadTrackingController.isSupported()) {
        throw new Error("Head tracking is not supported on this device or browser.");
      }

      if (this.enabled) {
        return true;
      }

      if (this._pendingEnable) {
        return this._pendingEnable;
      }

      this._pendingEnable = this._doEnable();
      try {
        const result = await this._pendingEnable;
        return result;
      } finally {
        this._pendingEnable = null;
      }
    }

    async _doEnable() {
      try {
        await this._prepareTf();
        await this._setupCamera();
        await this._loadModel();
        this._initFilters();
        this.enabled = true;
        this._renderLoop();
        return true;
      } catch (err) {
        this.disable();
        throw err;
      }
    }

    async _prepareTf() {
      if (this._tfReady || typeof tf === "undefined") {
        return;
      }

      try {
        await tf.setBackend("webgl");
      } catch (err) {
        console.warn("Falling back to WASM backend", err);
        try {
          await tf.setBackend("wasm");
        } catch (errWasm) {
          console.warn("Failed to set backend", errWasm);
        }
      }
      await tf.ready();
      this._tfReady = true;
    }

    async _setupCamera() {
      if (this.stream) {
        return;
      }

      this.video.playsInline = true;
      this.video.muted = true;
      this.video.hidden = true;

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });
      this.video.srcObject = this.stream;

      return new Promise((resolve, reject) => {
        const onLoaded = () => {
          this.video.removeEventListener("loadedmetadata", onLoaded);
          this.video.play().then(resolve).catch(reject);
        };
        this.video.addEventListener("loadedmetadata", onLoaded);
      });
    }

    async _loadModel() {
      if (this.model) {
        return;
      }
      this.model = await facemesh.load({ maxFaces: 1 });
    }

    _initFilters() {
      const freq = 30;
      this.filters = {
        yaw: new OneEuroFilter(freq, 1, 0.01, 0.1),
        pitch: new OneEuroFilter(freq, 1, 0.01, 0.1),
        roll: new OneEuroFilter(freq, 1, 0.015, 0.1)
      };
      this.lastTimestamp = performance.now() / 1000;
    }

    _renderLoop() {
      if (!this.enabled || !this.model) {
        return;
      }

      let lastFrameTime = 0;
      const targetFPS = 15; // Limit to 15 FPS for better performance
      const frameInterval = 1000 / targetFPS;

      const processFrame = async (currentTime) => {
        if (!this.enabled) {
          return;
        }

        const deltaTime = currentTime - lastFrameTime;
        
        // Throttle to target FPS
        if (deltaTime < frameInterval) {
          if (this.enabled) {
            this.frameRequest = requestAnimationFrame(processFrame);
          }
          return;
        }
        
        lastFrameTime = currentTime;

        try {
          const predictions = await this.model.estimateFaces(this.video, false, false);
          if (!this.enabled) {
            return;
          }

          if (predictions && predictions.length > 0) {
            const prediction = predictions[0];
            const confidence = prediction.faceInViewConfidence ?? 0;

            if (confidence >= CONFIDENCE_THRESHOLD) {
              const orientation = this._computeOrientation(prediction);
              this.onOrientation(orientation);
            } else {
              this.onOrientation({ yaw: 0, pitch: 0, roll: 0 });
            }
          }
        } catch (err) {
          console.warn("Frame processing error", err);
        }

        if (this.enabled) {
          this.frameRequest = requestAnimationFrame(processFrame);
        }
      };

      this.frameRequest = requestAnimationFrame(processFrame);
    }

    _computeOrientation(prediction) {
      const keypoints = prediction.scaledMesh || prediction.mesh;
      if (!keypoints) {
        return { yaw: 0, pitch: 0, roll: 0 };
      }

      const top = new THREE.Vector3(keypoints[10][0], keypoints[10][1], keypoints[10][2]);
      const bottom = new THREE.Vector3(keypoints[152][0], keypoints[152][1], keypoints[152][2]);
      const left = new THREE.Vector3(keypoints[234][0], keypoints[234][1], keypoints[234][2]);
      const right = new THREE.Vector3(keypoints[454][0], keypoints[454][1], keypoints[454][2]);

      const vertical = top.clone().addScaledVector(bottom, -1).normalize();
      const horizontal = left.clone().addScaledVector(right, -1).normalize();

      const yaw = radiansToDegrees(Math.PI / 2 - horizontal.angleTo(new THREE.Vector3(0, 0, 1)));
      const pitch = radiansToDegrees(Math.PI / 2 - vertical.angleTo(new THREE.Vector3(0, 0, 1)));
      const roll = radiansToDegrees(Math.PI / 2 - vertical.angleTo(new THREE.Vector3(1, 0, 0)));

      const timestamp = performance.now() / 1000;
      const filteredYaw = this.filters?.yaw.filter(clamp(yaw, -DEG_LIMIT, DEG_LIMIT), timestamp) ?? yaw;
      const filteredPitch = this.filters?.pitch.filter(clamp(pitch, -DEG_LIMIT, DEG_LIMIT), timestamp) ?? pitch;
      const filteredRoll = this.filters?.roll.filter(clamp(roll, -DEG_LIMIT, DEG_LIMIT), timestamp) ?? roll;

      return {
        yaw: filteredYaw,
        pitch: filteredPitch,
        roll: filteredRoll
      };
    }

    disable() {
      this.enabled = false;
      if (this.frameRequest) {
        cancelAnimationFrame(this.frameRequest);
        this.frameRequest = null;
      }

      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }

      if (this.video) {
        this.video.pause();
        this.video.srcObject = null;
      }

      this.onOrientation({ yaw: 0, pitch: 0, roll: 0 });
    }
  }

  window.HeadTrackingController = HeadTrackingController;
})();
