const socket = io();
const svg = document.getElementById('board');
const contextMenu = document.getElementById('contextMenu');
const clearMenu = document.getElementById('contextClear');
const resetMenu = document.getElementById('contextResetZoom');
const themeLight = document.getElementById('themeLight');
const themeDark = document.getElementById('themeDark');
const NS = 'http://www.w3.org/2000/svg';
const userList = document.getElementById('userList');
const userRects = {};
let username = `User${Math.floor(Math.random()*1000)}`;
let myColor = 'black';
let drawing = false;
let panning = false;
let panStartX = 0;
let panStartY = 0;
let lastX = 0,
  lastY = 0;
let scale = 1;
let fitScale = 1;
let offsetX = 0,
  offsetY = 0;

const BOARD_WIDTH = 1920;
const BOARD_HEIGHT = 1080;

svg.setAttribute('width', BOARD_WIDTH);
svg.setAttribute('height', BOARD_HEIGHT);
svg.setAttribute('viewBox', `0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`);

let currentTheme = 'light';
setTheme("light");

resizeBoard();
updateTransform();
window.addEventListener('resize', () => {
  resizeBoard();
  socket.emit('updateResolution', {
    width: BOARD_WIDTH / fitScale,
    height: BOARD_HEIGHT / fitScale,
  });
});

socket.on('connect', () => {
  socket.emit('join', {
    username,
    width: BOARD_WIDTH / fitScale,
    height: BOARD_HEIGHT / fitScale,
  });
});

function resizeBoard() {
  const sx = (window.innerWidth * 0.8) / BOARD_WIDTH;
  const sy = (window.innerHeight * 0.8) / BOARD_HEIGHT;
  fitScale = Math.min(sx, sy);
  updateTransform();
}

svg.addEventListener('pointerdown', start);
svg.addEventListener('pointerup', stop);
window.addEventListener('pointerup', stop);
svg.addEventListener('pointermove', draw);
svg.addEventListener('wheel', zoom, { passive: false });

svg.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (!panning) {
    showMenu(e.clientX, e.clientY);
  }
});

document.addEventListener('click', hideMenu);

themeLight.addEventListener('click', () => setTheme('light'));
themeDark.addEventListener('click', () => setTheme('dark'));
clearMenu.addEventListener('click', () => {
  hideMenu();
  clearBoard(true);
});
resetMenu.addEventListener('click', () => {
  hideMenu();
  resetZoom();
});

socket.on('draw', (data) => {
  drawLine(data.x0, data.y0, data.x1, data.y1, data.color, false);
});
socket.on('clear', () => {
  clearBoard(false);
});
socket.on('joined', (data) => {
  myColor = data.color;
  if (data.username) {
    username = data.username;
  }
});
socket.on('usersUpdate', (users) => {
  updateUsers(users);
});

function showMenu(x, y) {
  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
  contextMenu.style.display = 'block';
}

function hideMenu() {
  contextMenu.style.display = 'none';
}

function start(e) {
  if (e.button === 1 || e.buttons === 3) {
    panning = true;
    svg.setPointerCapture(e.pointerId);
    panStartX = e.clientX - offsetX;
    panStartY = e.clientY - offsetY;
    return;
  }
  drawing = true;
  svg.setPointerCapture(e.pointerId);
  [lastX, lastY] = getPos(e);
}

function stop(e) {
  drawing = false;
  if (panning) {
    panning = false;
  }
  if (e && svg.hasPointerCapture(e.pointerId)) {
    svg.releasePointerCapture(e.pointerId);
  }
}

function draw(e) {
  if (panning) {
    offsetX = e.clientX - panStartX;
    offsetY = e.clientY - panStartY;
    updateTransform();
    return;
  }
  if (!drawing) return;
  const [x, y] = getPos(e);
  drawLine(lastX, lastY, x, y, 'black', true);
  [lastX, lastY] = [x, y];
}

function zoom(e) {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 1.1 : 0.9;
  scale = Math.min(5, Math.max(0.2, scale * delta));
  updateTransform();
}

function resetZoom() {
  scale = 1;
  updateTransform();
}

function drawLine(x0, y0, x1, y1, color, emit) {
  const line = document.createElementNS(NS, 'line');
  line.setAttribute('x1', x0);
  line.setAttribute('y1', y0);
  line.setAttribute('x2', x1);
  line.setAttribute('y2', y1);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-linecap', 'round');
  line.setAttribute('pointer-events', 'none');
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

function updateTransform() {
  svg.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale * fitScale})`;
}

function getPos(e) {
  const rect = svg.getBoundingClientRect();
  return [
    (e.clientX - rect.left) / (scale * fitScale),
    (e.clientY - rect.top) / (scale * fitScale),
  ];
}

function setTheme(mode) {
  currentTheme = mode;
  if (mode === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
}

function updateUsers(users) {
  userList.innerHTML = '';
  const myId = socket.id;
  users.forEach((u) => {
    const li = document.createElement('li');
    li.textContent = u.username + (u.id === myId ? ' (You)' : '');
    li.style.color = u.color;
    userList.appendChild(li);

    let rect = userRects[u.id];
    if (!rect) {
      rect = document.createElementNS(NS, 'rect');
      rect.setAttribute('fill', 'none');
      rect.setAttribute('pointer-events', 'none');
      rect.setAttribute('opacity', '0.5');
      svg.appendChild(rect);
      userRects[u.id] = rect;
    }
    rect.setAttribute('stroke', u.color);
    rect.setAttribute('x', 0);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', u.width);
    rect.setAttribute('height', u.height);
  });

  Object.keys(userRects).forEach((id) => {
    if (!users.find((u) => u.id === id)) {
      svg.removeChild(userRects[id]);
      delete userRects[id];
    }
  });
}

