"use strict";

(function () {
  const slider = (element) => {
    element.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        const step = Number(element.step) || 1;
        element.value = Math.max(Number(element.min) || 0, Number(element.value) - step);
        element.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = Number(element.step) || 1;
        element.value = Math.min(Number(element.max) || 0, Number(element.value) + step);
        element.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    return element;
  };

  function secondsToTimecode(seconds) {
    if (!Number.isFinite(seconds)) {
      return "-:--";
    }
    const total = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function qs(selector, root = document) {
    const el = root.querySelector(selector);
    if (!el) {
      throw new Error(`Missing element ${selector}`);
    }
    return el;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const audioElement = qs("#player-audio");
    const trackListElement = qs("#track-list");
    const playButton = qs("#btn-play");
    const playIcon = qs("#btn-play-icon");
    const nextButton = qs("#btn-next");
    const prevButton = qs("#btn-prev");
    const progressSlider = slider(qs("#progress"));
    const currentTimeLabel = qs("#current-time");
    const durationLabel = qs("#duration");
    const headtrackingButton = qs("#btn-headtracking");
    const headtrackingLabel = headtrackingButton.querySelector(".headtracking-toggle__label");
    const lyricsContent = qs("#lyrics-content");
    const lyricsTrackLabel = qs("#lyrics-track-label");
    const roomSelect = document.querySelector("#room-select");
    const headtrackingMessage = document.querySelector("#headtracking-status");
    const headtrackingCanvas = document.querySelector("#headtracking-visual");
    const headtrackingCtx = headtrackingCanvas?.getContext("2d", { alpha: true });

    const trackElements = Array.from(trackListElement.querySelectorAll("[data-track-index]"));
    const trackData = trackElements.map((item, index) => ({
      index,
      title: item.querySelector(".player-card__track-title")?.textContent?.trim() || `Track ${index + 1}`,
      src: item.dataset.src,
      lyricsUrl: item.dataset.lyrics || null,
      element: item,
      durationDisplay: item.querySelector("[data-track-duration]") || null,
      durationSeconds: null
    }));

    let engine;
    let headtracking;
    let headtrackingActive = false;
    let lyricCache = new Map();
    let isSeeking = false;
    let lastUserAction = "pause";

    function setActiveTrack(index) {
      trackElements.forEach((el) => el.classList.remove("is-active"));
      const target = trackElements[index];
      if (target) {
        target.classList.add("is-active");
        target.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }

    function updatePlayState() {
      const isPlaying = !audioElement.paused && !audioElement.ended;
      playIcon.textContent = isPlaying ? "❚❚" : "▶";
      playButton.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
    }

    function updateProgress() {
      if (isSeeking) {
        return;
      }
      progressSlider.max = Number.isFinite(audioElement.duration) ? Math.floor(audioElement.duration) : 0;
      progressSlider.value = Math.floor(audioElement.currentTime || 0);
      currentTimeLabel.textContent = secondsToTimecode(audioElement.currentTime);
      durationLabel.textContent = secondsToTimecode(audioElement.duration);
    }

    function getNextIndex(step) {
      const next = (engine.getCurrentTrack().index + step + trackData.length) % trackData.length;
      return next;
    }

    async function changeTrack(index, shouldAutoplay = true) {
      const trackInfo = trackData[index];
      if (!trackInfo) {
        return;
      }

      setActiveTrack(index);
      durationLabel.textContent = "-:--";
      currentTimeLabel.textContent = "0:00";
      progressSlider.value = 0;
      progressSlider.max = 0;

      if (trackInfo.durationDisplay) {
        trackInfo.durationDisplay.textContent = trackInfo.durationSeconds
          ? secondsToTimecode(trackInfo.durationSeconds)
          : "–:–";
      }

      await showLyrics(trackInfo);

      try {
        await engine.loadTrack(index);
        if (lastUserAction === "play" && shouldAutoplay) {
          await engine.play();
        }
      } catch (err) {
        console.error("Failed to change track", err);
        alert(
          "Unable to load this track. If you're using Safari, please try Chrome or Firefox, or supply an AAC fallback."
        );
      }
    }

    function withLoadingState(button, fn) {
      button.disabled = true;
      button.classList.add("is-loading");
      return Promise.resolve()
        .then(fn)
        .finally(() => {
          button.disabled = false;
          button.classList.remove("is-loading");
        });
    }

    async function showLyrics(trackInfo) {
      if (!trackInfo) {
        return;
      }

      const label = `Track ${String(trackInfo.index + 1).padStart(2, "0")} · ${trackInfo.title}`;

      // Scroll to top when changing tracks
      lyricsContent.scrollTop = 0;

      if (lyricCache.has(trackInfo.lyricsUrl)) {
        lyricsContent.textContent = lyricCache.get(trackInfo.lyricsUrl);
        lyricsTrackLabel.textContent = label;
        return;
      }

      if (!trackInfo.lyricsUrl) {
        lyricsContent.textContent = "Lyrics will be added soon.";
        lyricsTrackLabel.textContent = label;
        return;
      }

      lyricsContent.textContent = "Loading…";
      lyricsTrackLabel.textContent = label;

      try {
        const response = await fetch(trackInfo.lyricsUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const text = await response.text();
        lyricCache.set(trackInfo.lyricsUrl, text);
        lyricsContent.textContent = text;
        lyricsTrackLabel.textContent = label;
      } catch (err) {
        console.warn("Unable to load lyrics", err);
        lyricsContent.textContent = "Lyrics will be added soon.";
        lyricsTrackLabel.textContent = label;
      }
    }

    function renderHeadtrackingVisual({ yaw = 0, pitch = 0 } = {}) {
      if (!headtrackingCtx || !headtrackingCanvas) {
        return;
      }

      const { width, height } = headtrackingCanvas;
      headtrackingCtx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const headRadius = width * 0.28;

      // Top-down view: head (circle)
      headtrackingCtx.beginPath();
      headtrackingCtx.arc(centerX, centerY, headRadius, 0, Math.PI * 2);
      headtrackingCtx.fillStyle = "rgba(20, 20, 20, 0.85)";
      headtrackingCtx.fill();
      headtrackingCtx.lineWidth = 2.5;
      headtrackingCtx.strokeStyle = "rgba(196, 58, 61, 0.7)";
      headtrackingCtx.stroke();

      // Nose (triangle) rotates with yaw
      const yawRad = (yaw * Math.PI) / 180;
      const noseLength = headRadius * 0.7;
      const noseWidth = headRadius * 0.35;

      // Nose tip (front of head)
      const noseTipX = centerX + Math.sin(yawRad) * noseLength;
      const noseTipY = centerY - Math.cos(yawRad) * noseLength;

      // Nose base corners
      const baseLeft = {
        x: centerX + Math.cos(yawRad) * noseWidth,
        y: centerY + Math.sin(yawRad) * noseWidth
      };
      const baseRight = {
        x: centerX - Math.cos(yawRad) * noseWidth,
        y: centerY - Math.sin(yawRad) * noseWidth
      };

      headtrackingCtx.beginPath();
      headtrackingCtx.moveTo(noseTipX, noseTipY);
      headtrackingCtx.lineTo(baseLeft.x, baseLeft.y);
      headtrackingCtx.lineTo(baseRight.x, baseRight.y);
      headtrackingCtx.closePath();
      headtrackingCtx.fillStyle = "rgba(196, 58, 61, 0.9)";
      headtrackingCtx.fill();
      headtrackingCtx.strokeStyle = "rgba(196, 58, 61, 1)";
      headtrackingCtx.lineWidth = 2;
      headtrackingCtx.stroke();
    }

    function initializeHeadtrackingButton() {
      const isSupported = typeof HeadTrackingController !== "undefined" && HeadTrackingController.isSupported();
      if (!isSupported) {
        headtrackingButton.disabled = true;
        headtrackingButton.setAttribute("aria-pressed", "false");
        headtrackingLabel.textContent = "Head tracking unavailable";
        headtrackingButton.title = "Requires a desktop browser with camera access.";
        if (headtrackingMessage) {
          headtrackingMessage.textContent = "Head tracking unavailable";
          headtrackingMessage.dataset.state = "inactive";
        }
      } else {
        headtrackingButton.disabled = false;
        headtrackingButton.removeAttribute("title");
      }
    }

    function setupEventListeners() {
      playButton.addEventListener("click", async () => {
        await engine.togglePlayback();
        lastUserAction = audioElement.paused ? "pause" : "play";
        updatePlayState();
      });

      nextButton.addEventListener("click", async () => {
        await changeTrack(getNextIndex(1));
      });
      prevButton.addEventListener("click", async () => {
        await changeTrack(getNextIndex(-1));
      });

      trackElements.forEach((item, index) => {
        item.addEventListener("click", async () => {
          await changeTrack(index);
        });
        item.addEventListener("keydown", async (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            await changeTrack(index);
          }
        });
      });

      audioElement.addEventListener("ended", async () => {
        const currentTrack = engine.getCurrentTrack();
        const isLastTrack = currentTrack.index === trackData.length - 1;
        
        if (isLastTrack) {
          await changeTrack(0, false);
          lastUserAction = "pause";
          updatePlayState();
        } else {
          await changeTrack(getNextIndex(1), true);
        }
      });

      headtrackingButton.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          headtrackingButton.click();
        }
      });

      audioElement.addEventListener("play", updatePlayState);
      audioElement.addEventListener("pause", updatePlayState);
      audioElement.addEventListener("timeupdate", updateProgress);
      audioElement.addEventListener("loadedmetadata", () => {
        const formattedDuration = secondsToTimecode(audioElement.duration);
        durationLabel.textContent = formattedDuration;
        progressSlider.max = Number.isFinite(audioElement.duration) ? Math.floor(audioElement.duration) : 0;
        const activeTrack = engine.getCurrentTrack();
        const trackInfo = trackData[activeTrack.index];
        if (trackInfo) {
          trackInfo.durationSeconds = Number.isFinite(audioElement.duration) ? audioElement.duration : null;
          if (trackInfo.durationDisplay) {
            trackInfo.durationDisplay.textContent = formattedDuration;
          }
        }
      });

      progressSlider.addEventListener("input", () => {
        isSeeking = true;
        currentTimeLabel.textContent = secondsToTimecode(Number(progressSlider.value));
      });
      progressSlider.addEventListener("change", () => {
        engine.seek(Number(progressSlider.value));
        isSeeking = false;
      });

      headtrackingButton.addEventListener("click", async () => {
        if (!headtrackingActive) {
          await withLoadingState(headtrackingButton, async () => {
            try {
              if (!headtracking) {
                headtracking = new HeadTrackingController({
                  onOrientation: (orientation) => {
                    if (!headtrackingActive) {
                      return;
                    }
                    const { yaw = 0, pitch = 0, roll = 0 } = orientation || {};
                    // IEM approach: Just store raw values, interval will handle filtering
                    // Negate yaw to fix left/right swap from manifest encoding
                    engine.setOrientation({ yaw: -yaw, pitch, roll });
                    renderHeadtrackingVisual({ yaw: -yaw, pitch });
                  }
                });
              }
              await headtracking.enable();
              headtrackingActive = true;
              // IEM approach: Start 40 FPS spatial audio updates
              engine.startSpatialUpdates();
              headtrackingButton.classList.add("is-active");
              headtrackingButton.setAttribute("aria-pressed", "true");
              headtrackingLabel.textContent = "Disable head tracking";
              if (headtrackingMessage) {
                headtrackingMessage.textContent = "Head tracking active";
                headtrackingMessage.dataset.state = "active";
              }
              // Don't render visual here - let the first orientation callback handle it
            } catch (err) {
              console.warn("Head tracking failed", err);
              const errorMsg = err.message || err.name || "Unknown error";
              let userMessage = "";
              
              if (errorMsg.includes("NotFoundError") || errorMsg.includes("device not found") || errorMsg.includes("Requested device")) {
                userMessage = "Camera not detected. Please check: Your webcam is plugged in, no other app is using the camera\n• Try refreshing the page";
              } else if (errorMsg.includes("permission") || errorMsg.includes("Permission") || errorMsg.includes("denied") || errorMsg.includes("NotAllowedError")) {
                userMessage = "Camera access denied.\n\nPlease:\n• Click 'Allow' when prompted\n• Check browser camera permissions\n• Refresh the page and try again";
              } else if (errorMsg.includes("NotReadableError") || errorMsg.includes("in use")) {
                userMessage = "Camera is busy.\n\nPlease:\n• Close other apps using the camera\n• Close other browser tabs\n• Refresh the page";
              } else {
                userMessage = "Camera not available.\n\nPlease:\n• Check your webcam connection\n• Allow camera access in browser settings\n• Use Chrome or Firefox for best results";
              }
              
              alert(`Head tracking unavailable\n\n${userMessage}`);
              headtracking = null;
              headtrackingActive = false;
              headtrackingButton.classList.remove("is-active");
              headtrackingButton.setAttribute("aria-pressed", "false");
              headtrackingLabel.textContent = "Enable head tracking";
              if (headtrackingMessage) {
                headtrackingMessage.textContent = "Head tracking disabled";
                headtrackingMessage.dataset.state = "inactive";
              }
              renderHeadtrackingVisual({ yaw: 0, pitch: 0 });
            }
          });
        } else {
          await withLoadingState(headtrackingButton, async () => {
            try {
              if (headtracking) {
                await headtracking.disable();
              }
              headtrackingActive = false;
              // IEM approach: Stop spatial updates and reset
              engine.stopSpatialUpdates();
              engine.resetOrientation();
              headtrackingButton.classList.remove("is-active");
              headtrackingButton.setAttribute("aria-pressed", "false");
              headtrackingLabel.textContent = "Enable head tracking";
              if (headtrackingMessage) {
                headtrackingMessage.textContent = "Head tracking disabled";
                headtrackingMessage.dataset.state = "inactive";
              }
              renderHeadtrackingVisual({ yaw: 0, pitch: 0 });
            } catch (err) {
              console.warn("Error disabling head tracking", err);
            }
          });
        }
      });

      roomSelect?.addEventListener("change", async (event) => {
        const { value } = event.target;
        try {
          await engine.setReverbImpulse(value || null);
        } catch (err) {
          console.error("Failed to load room impulse", err);
          const errorMsg = err.message || "Unknown error";
          let help = "\n\nTroubleshooting:\n";
          help += "• Check that the impulse response file exists\n";
          help += "• Make sure the file is a valid WAV file\n";
          help += "• The player will continue in binaural (dry) mode\n";
          alert(`Unable to load room ambience.\n\nError: ${errorMsg}${help}`);
          roomSelect.value = "";
        }
      });
    }

    try {
      engine = new BolaireAudioEngine({
        tracks: trackData
      });

      setupEventListeners();
      initializeHeadtrackingButton();

      await engine.init();
      
      // Update track durations in UI from preloaded data
      trackData.forEach((track, index) => {
        if (track.durationDisplay && track.durationSeconds) {
          track.durationDisplay.textContent = secondsToTimecode(track.durationSeconds);
        }
      });
      
      // Load first track
      await changeTrack(0, false);
      updatePlayState();
      updateProgress();
    } catch (err) {
      console.error("Player initialisation failed", err);
      const errorMsg = err.message || "Unknown error";
      let helpText = "\n\nTroubleshooting tips:\n";
      
      if (errorMsg.includes("dash.js") || errorMsg.includes("ambisonics")) {
        helpText += "• Make sure all JavaScript dependencies are loaded\n";
        helpText += "• Try refreshing the page\n";
      } else if (errorMsg.includes("Audio element")) {
        helpText += "• The audio element is missing from the page\n";
        helpText += "• Try reloading the page\n";
      } else if (errorMsg.includes("Web Audio API")) {
        helpText += "• Your browser doesn't support Web Audio API\n";
        helpText += "• Try using Chrome or Firefox instead\n";
      } else if (errorMsg.includes("Timed out") || errorMsg.includes("metadata")) {
        helpText += "• Audio file failed to load\n";
        helpText += "• Check your internet connection\n";
        helpText += "• Safari doesn't support multichannel OPUS - use Chrome or Firefox\n";
      } else {
        helpText += "• Try using Chrome or Firefox for best compatibility\n";
        helpText += "• Check the browser console (F12) for detailed errors\n";
        helpText += "• Make sure you're using a modern browser version\n";
      }
      
      alert(`The immersive player could not be initialised.\n\nError: ${errorMsg}${helpText}`);
    }

    window.addEventListener("beforeunload", () => {
      headtracking?.disable();
      engine?.destroy();
    });

    if (headtrackingMessage) {
      headtrackingMessage.textContent = "Head tracking disabled";
      headtrackingMessage.dataset.state = "inactive";
    }
    renderHeadtrackingVisual({ yaw: 0, pitch: 0 });
  });
})();
