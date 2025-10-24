document.addEventListener("DOMContentLoaded", () => {
  loadWarnings();
});

let prediction = null;
let warnings = [];

/////////////////////////////////////////////////////
//////////       DATA LOADING       /////////////
/////////////////////////////////////////////////////

function loadWarnings() {
  fetch("warnings.json")
    .then((response) => response.json())
    .then((data) => {
      warnings = data.warnings || [];
      // Initialize prediction element reference after data is loaded
      prediction = document.getElementById("warning-prediction");
      setTimeout(showPrediction, 1000);
    })
    .catch((error) => {
      console.error("Failed to load warnings:", error);
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
  if (!prediction) {
    console.warn(
      "Missing #warning-prediction element; aborting showPrediction"
    );
    return;
  }

  const predictionText = createRandomPrediction();
  prediction.innerHTML = predictionText;

  // Use setTimeout to ensure DOM update has occurred
  setTimeout(() => {
    const warningText = prediction.querySelector(".warning-text");
    if (warningText) {
      warningText.classList.add("fade-in");
    }
  }, 0);
}

/////////////////////////////////////////////////////
//////////       INITIALIZATION       /////////////
/////////////////////////////////////////////////////

loadWarnings();
