const SUPPORTED_LANGUAGE = "es";
const DEFAULT_LANGUAGE = "en";

let prediction = null;
let warnings = [];
let uiText = {};
let warningRefreshTimeout = null;

document.addEventListener("DOMContentLoaded", () => {
  initializePage();
});

/////////////////////////////////////////////////////
//////////       DATA LOADING       /////////////
/////////////////////////////////////////////////////

function getPreferredLanguage() {
  const browserLanguage = navigator.language || navigator.userLanguage || "";
  return browserLanguage.toLowerCase().startsWith(SUPPORTED_LANGUAGE)
    ? SUPPORTED_LANGUAGE
    : DEFAULT_LANGUAGE;
}

function getContentFiles(language) {
  if (language === SUPPORTED_LANGUAGE) {
    return {
      warningsFile: "warnings-es.json",
      uiTextFile: "ui-text-es.json"
    };
  }

  return {
    warningsFile: "warnings.json",
    uiTextFile: "ui-text.json"
  };
}

function loadJson(filePath) {
  return fetch(filePath).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${filePath}: ${response.status}`);
    }

    return response.json();
  });
}

function initializePage() {
  prediction = document.getElementById("warning-prediction");
  setLanguage(getPreferredLanguage());
}

function setLanguage(language) {
  const nextLanguage =
    language === SUPPORTED_LANGUAGE ? SUPPORTED_LANGUAGE : DEFAULT_LANGUAGE;
  const { warningsFile, uiTextFile } = getContentFiles(nextLanguage);

  Promise.all([loadJson(warningsFile), loadJson(uiTextFile)])
    .then(([warningData, textData]) => {
      warnings = warningData.warnings || [];
      uiText = textData;

      applyUIText(nextLanguage);
      queuePredictionRefresh();
    })
    .catch((error) => {
      console.error("Failed to initialize localized content:", error);
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

function setTextContent(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value;
  }
}

function applyUIText(language) {
  document.documentElement.lang = language;
  setTextContent("page-title", uiText.title || "");
  setTextContent("page-subtitle", uiText.subtitle || "");
  setTextContent("loading-text", uiText.loading || "");
  setTextContent("cta-text", uiText.cta || "");
  setTextContent("footer-text", uiText.footer || "");
}

function queuePredictionRefresh() {
  if (warningRefreshTimeout) {
    clearTimeout(warningRefreshTimeout);
  }

  if (!prediction) {
    return;
  }

  prediction.innerHTML =
    '<span class="spinner"></span><span class="loading-text" id="loading-text"></span>';
  setTextContent("loading-text", uiText.loading || "");
  warningRefreshTimeout = setTimeout(showPrediction, 1000);
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

  if (!warnings.length) {
    console.warn("Warnings list is empty; aborting showPrediction");
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
