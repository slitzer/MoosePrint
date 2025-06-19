const socket = io();
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
let drawing = false;

canvas.addEventListener('mousedown', start);
canvas.addEventListener('mouseup', stop);
canvas.addEventListener('mouseout', stop);
canvas.addEventListener('mousemove', draw);

socket.on('draw', (data) => {
  drawLine(data.x0, data.y0, data.x1, data.y1, data.color, false);
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

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return [e.clientX - rect.left, e.clientY - rect.top];
}
