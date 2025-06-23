const socket = io();
const svg = document.getElementById('board');
const clearBtn = document.getElementById('clear');
const resetZoomBtn = document.getElementById('resetZoom');
const NS = 'http://www.w3.org/2000/svg';
let drawing = false;
let lastX = 0,
  lastY = 0;
let scale = 1;

resizeBoard();
svg.style.transform = `scale(${scale})`;
window.addEventListener('resize', () => {
  resizeBoard();
  svg.style.transform = `scale(${scale})`;
});

function resizeBoard() {
  svg.setAttribute('width', window.innerWidth * 0.8);
  svg.setAttribute('height', window.innerHeight * 0.8);
}

svg.addEventListener('mousedown', start);
svg.addEventListener('mouseup', stop);
svg.addEventListener('mouseleave', stop);
svg.addEventListener('mousemove', draw);
svg.addEventListener('wheel', zoom, { passive: false });
clearBtn.addEventListener('click', () => clearBoard(true));
resetZoomBtn.addEventListener('click', resetZoom);

socket.on('draw', (data) => {
  drawLine(data.x0, data.y0, data.x1, data.y1, data.color, false);
});
socket.on('clear', () => {
  clearBoard(false);
});

function start(e) {
  drawing = true;
  [lastX, lastY] = getPos(e);
}

function stop() {
  drawing = false;
}

function draw(e) {
  if (!drawing) return;
  const [x, y] = getPos(e);
  drawLine(lastX, lastY, x, y, 'black', true);
  [lastX, lastY] = [x, y];
}

function zoom(e) {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 1.1 : 0.9;
  scale = Math.min(5, Math.max(1, scale * delta));
  svg.style.transform = `scale(${scale})`;
}

function resetZoom() {
  scale = 1;
  svg.style.transform = 'scale(1)';
}

function drawLine(x0, y0, x1, y1, color, emit) {
  const line = document.createElementNS(NS, 'line');
  line.setAttribute('x1', x0);
  line.setAttribute('y1', y0);
  line.setAttribute('x2', x1);
  line.setAttribute('y2', y1);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-linecap', 'round');
  svg.appendChild(line);
  if (!emit) return;
  socket.emit('draw', { x0, y0, x1, y1, color });
}

function clearBoard(emit) {
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
  if (emit) socket.emit('clear');
}

function getPos(e) {
  const rect = svg.getBoundingClientRect();
  return [
    (e.clientX - rect.left) / scale,
    (e.clientY - rect.top) / scale,
  ];
}

