const socket = io();
const canvas = document.getElementById('board');
const clearBtn = document.getElementById('clear');
const resetZoomBtn = document.getElementById('resetZoom');
const ctx = canvas.getContext('2d');
let drawing = false;
let lastX = 0,
  lastY = 0;
let scale = 1;

resizeCanvas();
canvas.style.transform = `scale(${scale})`;
window.addEventListener('resize', () => {
  resizeCanvas();
  canvas.style.transform = `scale(${scale})`;
});

function resizeCanvas() {
  canvas.width = window.innerWidth * 0.8;
  canvas.height = window.innerHeight * 0.8;
}

canvas.addEventListener('mousedown', start);
canvas.addEventListener('mouseup', stop);
canvas.addEventListener('mouseout', stop);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('wheel', zoom, { passive: false });
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
  scale = Math.min(5, Math.max(0.2, scale * delta));
  canvas.style.transform = `scale(${scale})`;
}

function resetZoom() {
  scale = 1;
  canvas.style.transform = 'scale(1)';
}

function drawLine(x0, y0, x1, y1, color, emit) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.closePath();
  if (!emit) return;
  socket.emit('draw', { x0, y0, x1, y1, color });
}

function clearBoard(emit) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (emit) socket.emit('clear');
}

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return [
    (e.clientX - rect.left) / scale,
    (e.clientY - rect.top) / scale,
  ];
}

