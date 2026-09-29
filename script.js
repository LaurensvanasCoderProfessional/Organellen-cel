// Dataset van organellen verdeeld over 3 niveaus
const levels = [
  {
    level: 1,
    title: "Niveau 1: De Basisorganellen",
    organelles: [
      { id: "celkern", name: "Celkern", x: 18, y: 42 },
      { id: "celmembraan", name: "Celmembraan", x: 62, y: 5 },
      { id: "cytoplasma", name: "Cytoplasma", x: 60, y: 80 }
    ]
  },
  {
    level: 2,
    title: "Niveau 2: Energie & Opslag",
    organelles: [
      { id: "celkern", name: "Celkern", x: 18, y: 42 },
      { id: "celmembraan", name: "Celmembraan", x: 62, y: 5 },
      { id: "cytoplasma", name: "Cytoplasma", x: 60, y: 80 },
      { id: "mitochondrie", name: "Mitochondrie", x: 65, y: 22 },
      { id: "vacuole", name: "Vacuole", x: 45, y: 48 }
    ]
  },
  {
    level: 3,
    title: "Niveau 3: Alle Organellen",
    organelles: [
      { id: "celkern", name: "Celkern", x: 18, y: 42 },
      { id: "celmembraan", name: "Celmembraan", x: 62, y: 5 },
      { id: "cytoplasma", name: "Cytoplasma", x: 60, y: 80 },
      { id: "mitochondrie", name: "Mitochondrie", x: 65, y: 22 },
      { id: "vacuole", name: "Vacuole", x: 45, y: 48 },
      { id: "bladgroenkorrel", name: "Bladgroenkorrel", x: 10, y: 18 },
      { id: "er", name: "Endoplasmatisch Reticulum", x: 40, y: 35 },
      { id: "ribosoom", name: "Ribosoom", x: 42, y: 28 }
    ]
  }
];

let currentLevelIndex = 0;
let score = 0;
let correctInCurrentLevel = 0;
let timeLeft = 300; // 5 minuten in seconden
let timerInterval = null;

// Elementen selecteren
const dropZonesContainer = document.getElementById("drop-zones-container");
const labelsContainer = document.getElementById("labels-container");
const scoreDisplay = document.getElementById("score-display");
const levelDisplay = document.getElementById("level-display");
const timerDisplay = document.getElementById("timer-display");
const feedbackMsg = document.getElementById("feedback-message");
const progressBar = document.getElementById("progress-bar");
const nextBtn = document.getElementById("next-btn");
const endModal = document.getElementById("end-modal");
const finalStats = document.getElementById("final-stats");

// Start de game
function initGame() {
  startTimer();
  loadLevel(currentLevelIndex);
  
  nextBtn.addEventListener("click", () => {
    currentLevelIndex++;
    if (currentLevelIndex < levels.length) {
      loadLevel(currentLevelIndex);
      nextBtn.disabled = true;
    } else {
      endGame(true);
    }
  });
}

// Timer starten
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    timerDisplay.textContent = `minutes.toString().padStart(2,'0'):{seconds.toString().padStart(2, '0')}`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame(false);
    }
  }, 1000);
}

// Niveau laden
function loadLevel(index) {
  correctInCurrentLevel = 0;
  const levelData = levels[index];
  
  levelDisplay.textContent = `${levelData.level} / ${levels.length}`;
  showFeedback(`Welkom bij ${levelData.title}! Sleep de namen naar de juiste vakjes.`, "neutral");
  updateProgressBar();

  // Oude content wissen
  dropZonesContainer.innerHTML = "";
  labelsContainer.innerHTML = "";

  // Dropzones aanmaken op de cel
  levelData.organelles.forEach(org => {
    const zone = document.createElement("div");
    zone.classList.add("drop-zone");
    zone.style.left = org.x + "%";
    zone.style.top = org.y + "%";
    zone.dataset.organelle = org.id;
    zone.textContent = "Plaats hier";

    // Drag events voor dropzones
    zone.addEventListener("dragover", dragOver);
    zone.addEventListener("dragenter", dragEnter);
    zone.addEventListener("dragleave", dragLeave);
    zone.addEventListener("drop", dropItem);

    dropZonesContainer.appendChild(zone);
  });

  // Draggable labels aanmaken en willekeurig schudden (shuffle)
  const shuffled = [...levelData.organelles].sort(() => Math.random() - 0.5);
  shuffled.forEach(org => {
    const label = document.createElement("div");
    label.classList.add("draggable-label");
    label.draggable = true;
    label.id = "label-" + org.id;
    label.dataset.organelle = org.id;
    label.textContent = org.name;

    label.addEventListener("dragstart", dragStart);

    labelsContainer.appendChild(label);
  });
}

// Drag & Drop Functies
function dragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.organelle);
}

function dragOver(e) {
  e.preventDefault();
}

function dragEnter(e) {
  e.preventDefault();
  this.classList.add("drag-over");
}

function dragLeave() {
  this.classList.remove("drag-over");
}

function dropItem(e) {
  e.preventDefault();
  this.classList.remove("drag-over");

  const draggedId = e.dataTransfer.getData("text/plain");
  const targetId = this.dataset.organelle;

  // Als het vakje al gevuld is, negeren
  if (this.classList.contains("filled")) return;

  if (draggedId === targetId) {
    // Goed antwoord!
    this.classList.add("filled");
    const labelElem = document.getElementById("label-" + draggedId);
    
    this.textContent = labelElem.textContent;
    labelElem.classList.add("disabled");
    labelElem.draggable = false;

    score += 10;
    correctInCurrentLevel++;
    scoreDisplay.textContent = score;

    showFeedback("✅ Goed zo! Dat is het juiste organel.", "correct");
    updateProgressBar();

    // Check of niveau klaar is
    if (correctInCurrentLevel === levels[currentLevelIndex].organelles.length) {
      showFeedback("🎉 Niveau gehaald! Klik op 'Volgend Niveau'.", "correct");
      nextBtn.disabled = false;
    }
  } else {
    // Fout antwoord!
    score = Math.max(0, score - 2);
    scoreDisplay.textContent = score;
    showFeedback("❌ Helaas, dat is niet de juiste plek. Probeer opnieuw!", "wrong");
  }
}

function showFeedback(text, type) {
  feedbackMsg.textContent = text;
  feedbackMsg.className = "feedback-message " + type;
}

function updateProgressBar() {
  const totalInLevel = levels[currentLevelIndex].organelles.length;
  const percentage = (correctInCurrentLevel / totalInLevel) * 100;
  progressBar.style.width = percentage + "%";
}

function endGame(completed) {
  clearInterval(timerInterval);
  endModal.style.display = "flex";
  if (completed) {
    finalStats.textContent = `Je hebt alle niveaus voltooid! Eindscore: ${score} punten.`;
  } else {
    finalStats.textContent = `De tijd is om! Je score is: ${score} punten.`;
  }
}

// Start het spel wanneer de pagina geladen is
window.onload = initGame;

