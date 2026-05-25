
let model = null;
let webcam = null;
let isRunning = false;
let animationId = null;
let lastFrameTime = performance.now();
let frameCount = 0;
let lastFpsUpdate = performance.now();

const modelURL   = document.getElementById('modelURL');
const loadBtn    = document.getElementById('loadBtn');
const startBtn   = document.getElementById('startBtn');
const stopBtn    = document.getElementById('stopBtn');
const darkToggle = document.getElementById('darkToggle');
const statusDot  = document.getElementById('statusDot');
const statusLabel= document.getElementById('statusLabel');
const webcamContainer = document.getElementById('webcamContainer');
const webcamPlaceholder = document.getElementById('webcamPlaceholder');
const webcamFrame= document.getElementById('webcamFrame');
const scanLine   = document.getElementById('scanLine');
const resultsList= document.getElementById('resultsList');
const heroPrediction = document.getElementById('heroPrediction');
const heroLabel  = document.getElementById('heroLabel');
const heroConfidence = document.getElementById('heroConfidence');
const heroBar    = document.getElementById('heroBar');
const semaphoreRing = document.getElementById('semaphoreRing');
const fpsBadge   = document.getElementById('fpsBadge');
const logBody    = document.getElementById('logBody');
const clearLog   = document.getElementById('clearLog');

function log(msg, type = 'info') {
  const ts = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${ts}] ${msg}`;
  logBody.appendChild(entry);
  logBody.scrollTop = logBody.scrollHeight;
}

function setStatus(label, state = '') {
  statusLabel.textContent = label;
  statusDot.className = 'status-dot ' + state;
}


function getConfidenceClass(probability) {
  const pct = probability * 100;
  if (pct >= 90) return 'high';
  if (pct >= 50) return 'mid';
  return 'low';
}



darkToggle.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  log(isDark ? 'Modo oscuro activado' : 'Modo claro activado', 'info');

  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

(function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.body.classList.add('dark');
  }
})();

loadBtn.addEventListener('click', async () => {
  const url = modelURL.value.trim();
  if (!url) {
    log('Ingresa una URL de modelo válida', 'warn');
    return;
  }

  setStatus('Cargando...', 'loading');
  loadBtn.disabled = true;
  log(`Cargando modelo desde: ${url}`, 'info');

  try {
    const modelJsonURL  = url.endsWith('/') ? url + 'model.json'  : url + '/model.json';
    const metadataURL   = url.endsWith('/') ? url + 'metadata.json': url + '/metadata.json';

    model = await tmImage.load(modelJsonURL, metadataURL);

    setStatus('Modelo listo', 'active');
    startBtn.disabled = false;
    log(`Modelo cargado. Clases: ${model.getTotalClasses()}`, 'success');
    log('Presiona "Iniciar cámara" para comenzar', 'info');

    // Preconstruir filas del listado
    buildResultRows(model.getTotalClasses());

  } catch (err) {
    setStatus('Error', 'error');
    log(`Error al cargar: ${err.message}`, 'error');
    log('Verifica que la URL sea correcta y pública', 'warn');
    console.error(err);
  } finally {
    loadBtn.disabled = false;
  }
});

function buildResultRows(count) {
  resultsList.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const item = document.createElement('div');
    item.className = 'result-item';
    item.id = `row-${i}`;
    item.innerHTML = `
      <span class="result-name" id="name-${i}">Clase ${i + 1}</span>
      <div class="result-bar-wrap">
        <div class="result-bar" id="bar-${i}"></div>
      </div>
      <span class="result-pct" id="pct-${i}">0%</span>
    `;
    resultsList.appendChild(item);
  }
}

startBtn.addEventListener('click', async () => {
  if (!model) return;

  setStatus('Iniciando...', 'loading');
  startBtn.disabled = true;
  log('Solicitando acceso a la cámara...', 'info');

  try {
    const flip = true; // Espejear horizontalmente
    webcam = new tmImage.Webcam(332, 249, flip);
    await webcam.setup();
    await webcam.play();

    // Ocultar placeholder y mostrar canvas
    webcamPlaceholder.style.display = 'none';
    webcamContainer.appendChild(webcam.canvas);
    webcamFrame.classList.add('active');
    scanLine.classList.add('active');

    isRunning = true;
    stopBtn.disabled = false;
    setStatus('Clasificando', 'active');
    log('Cámara activa. Clasificando en tiempo real...', 'success');

    loop();

  } catch (err) {
    setStatus('Error de cámara', 'error');
    log(`No se pudo acceder a la cámara: ${err.message}`, 'error');
    startBtn.disabled = false;
  }
});

stopBtn.addEventListener('click', () => {
  isRunning = false;
  cancelAnimationFrame(animationId);

  if (webcam) {
    webcam.stop();
    webcamContainer.innerHTML = '';
    webcam = null;
  }

  webcamPlaceholder.style.display = 'flex';
  webcamFrame.classList.remove('active');
  scanLine.classList.remove('active');

  startBtn.disabled = false;
  stopBtn.disabled = true;
  setStatus('Detenido', '');
  log('Clasificación detenida', 'warn');


  heroLabel.textContent = '—';
  heroConfidence.textContent = 'Cámara detenida';
  heroBar.style.width = '0%';
  heroBar.style.background = '';
  semaphoreRing.className = 'semaphore-ring';
});

async function loop() {
  if (!isRunning) return;

  webcam.update(); 

  const predictions = await model.predict(webcam.canvas);

  frameCount++;
  const now = performance.now();
  if (now - lastFpsUpdate >= 1000) {
    fpsBadge.textContent = `${frameCount} fps`;
    frameCount = 0;
    lastFpsUpdate = now;
  }

  const sorted = [...predictions].sort((a, b) => b.probability - a.probability);
  const top = sorted[0];

  const topClass = getConfidenceClass(top.probability);
  heroLabel.textContent = top.className;
  heroConfidence.textContent = `Confianza: ${(top.probability * 100).toFixed(1)}%`;

  heroBar.style.width = `${(top.probability * 100).toFixed(1)}%`;
  heroBar.style.background = getColorByClass(topClass);

  semaphoreRing.className = `semaphore-ring ${topClass}`;

  predictions.forEach((pred, i) => {
    const pct = (pred.probability * 100).toFixed(1);
    const level = getConfidenceClass(pred.probability);
    const row   = document.getElementById(`row-${i}`);
    const bar   = document.getElementById(`bar-${i}`);
    const pctEl = document.getElementById(`pct-${i}`);
    const nameEl= document.getElementById(`name-${i}`);

    if (!row) return;

    nameEl.textContent = pred.className;

    row.classList.remove('confidence-high', 'confidence-mid', 'confidence-low');
    row.classList.add(`confidence-${level}`);

    bar.style.width = `${pct}%`;
    pctEl.textContent = `${pct}%`;
  });

  animationId = requestAnimationFrame(loop);
}

function getColorByClass(level) {
  const style = getComputedStyle(document.documentElement);
  if (level === 'high') return style.getPropertyValue('--color-high').trim();
  if (level === 'mid')  return style.getPropertyValue('--color-mid').trim();
  return style.getPropertyValue('--color-low').trim();
}

clearLog.addEventListener('click', () => {
  logBody.innerHTML = '';
  log('Log limpiado', 'info');
});

modelURL.addEventListener('keydown', e => {
  if (e.key === 'Enter') loadBtn.click();
});

log('ML Vision listo. Ingresa una URL de Teachable Machine para comenzar.', 'info');
