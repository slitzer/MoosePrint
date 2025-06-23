const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const users = {};

function randomColor() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
}

function getUsers() {
  return Object.entries(users).map(([id, u]) => ({ id, ...u }));
}

app.use(express.static(path.join(__dirname, '..', 'public')));

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('join', ({ username, width, height }) => {
    const color = randomColor();
    const name = username && username.trim() ? username : `User${Math.floor(Math.random() * 1000)}`;
    users[socket.id] = { username: name, color, width, height };
    socket.emit('joined', { color, username: name });
    io.emit('usersUpdate', getUsers());
  });

  socket.on('updateResolution', ({ width, height }) => {
    if (users[socket.id]) {
      users[socket.id].width = width;
      users[socket.id].height = height;
      io.emit('usersUpdate', getUsers());
    }
  });
  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
  });
  socket.on('clear', () => {
    socket.broadcast.emit('clear');
  });
  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('usersUpdate', getUsers());
    console.log('user disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
