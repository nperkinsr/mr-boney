const prediction = document.getElementById("warning-prediction");

const SOUND_FILE_PATH = "./assets/prediction.mp3"; // Naming convention is called "SCREAMING_SNAKE_CASE"
let warnings = [];
let warningSound = null;

/////////////////////////////////////////////////////
//////////       DATA LOADING       /////////////
/////////////////////////////////////////////////////

function loadWarnings() {
  // Load both warnings and sound
  Promise.all([
    fetch("warnings.json").then((response) => response.json()),
    loadSound(),
  ])
    .then(([data]) => {
      warnings = data.warnings || [];
      setTimeout(showPrediction, 1000); // 1 second delay
    })
    .catch((error) => console.error("Failed to load resources:", error));
}

function loadSound() {
  return new Promise((resolve, reject) => {
    warningSound = new Audio(SOUND_FILE_PATH);
    warningSound.preload = "auto";

    warningSound.addEventListener("canplaythrough", () => {
      resolve();
    });
    warningSound.addEventListener("error", (e) => {
      console.error("Error loading sound:", e);
      reject(e);
    });
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
