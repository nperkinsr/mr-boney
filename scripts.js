document.addEventListener("DOMContentLoaded", () => {
  loadWarnings();
});

document.getElementById("reveal-btn").addEventListener("click", showPrediction);


let prediction = null; // will be resolved when needed

const SOUND_FILE_PATH = "./assets/prediction.mp3"; // Naming convention is called "SCREAMING_SNAKE_CASE"
let warnings = [];
let warningSound = null;

/////////////////////////////////////////////////////
//////////       DATA LOADING       /////////////
/////////////////////////////////////////////////////

function loadWarnings() {
  // Load warnings immediately; start loading sound but don't block rendering.
  loadSound().catch((e) => {
    console.warn("Sound failed to load (continuing without sound):", e);
  });

  fetch("warnings.json")
    .then((response) => response.json())
    .then((data) => {
      warnings = data.warnings || [];
      setTimeout(showPrediction, 1000); // 1 second delay
    })
    .catch((error) => console.error("Failed to load warnings:", error));
}

function loadSound() {
  // Resolve even if the audio can't load or canplaythrough never fires (mobile).
  return new Promise((resolve) => {
    warningSound = new Audio(SOUND_FILE_PATH);
    warningSound.preload = "auto";

    const cleanup = () => {
      warningSound.removeEventListener("canplaythrough", onReady);
      warningSound.removeEventListener("loadeddata", onReady);
      warningSound.removeEventListener("error", onError);
      clearTimeout(timeoutId);
    };

    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = (e) => {
      console.warn("Error loading sound:", e);
      cleanup();
      resolve(); // resolve so UI isn't blocked
    };

    warningSound.addEventListener("canplaythrough", onReady);
    warningSound.addEventListener("loadeddata", onReady);
    warningSound.addEventListener("error", onError);

    // Fallback: if events never fire (mobile/autoplay restrictions), continue after timeout
    const timeoutId = setTimeout(() => {
      console.warn("Sound load timeout; continuing without fully loaded audio");
      cleanup();
      resolve();
    }, 3000);
  });
}

/////////////////////////////////////////////////////
//////////       UTILITIES       /////////////
/////////////////////////////////////////////////////

function getRandomItemFromList(list) {
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

function createRandomPrediction() {
  const warning = getRandomItemFromList(warnings);
  return `<span class="warning-text">${warning}</span>`;
}

/////////////////////////////////////////////////////
//////////       PREDICTION DISPLAY       /////////////
/////////////////////////////////////////////////////

function showPrediction() {
  // ensure the element exists (script might run before DOM ready)
  if (!prediction) prediction = document.getElementById("warning-prediction");
  if (!prediction) {
    console.warn(
      "Missing #warning-prediction element; aborting showPrediction"
    );
    return;
  }

  const predictionText = createRandomPrediction();
  prediction.innerHTML = predictionText;

  const warningText = prediction.querySelector(".warning-text");

  // Play sound only if it's loaded
  if (warningSound) {
    try {
      warningSound.currentTime = 0;
      const playPromise = warningSound.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Playback prevented by browser:", error);
        });
      }
    } catch (e) {
      console.error("Error playing sound:", e);
    }
  }

  requestAnimationFrame(() => {
    warningText.classList.add("fade-in");
  });
}

/////////////////////////////////////////////////////
//////////       INITIALIZATION       /////////////
/////////////////////////////////////////////////////

loadWarnings();
