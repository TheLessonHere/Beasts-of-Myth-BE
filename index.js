// Dependencies
const express = require('express');
const socketio = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');

// Server declaration + middleware dependecy addition
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = socketio(server);

// Setting up base route
app.get('/', (req, res)=>{
    res.status(200).send({ message: 'Welcome to the Beasts of Myth API!' })
  })

// Routers
const { authenticate } = require('./auth/middleware.js');

const authRouter = require('./auth/auth-router.js');
app.use('/api/auth', authRouter);

const userRouter = require('./routers/users/user-router');
app.use('/api/user', authenticate, userRouter);

const teamsRouter = require('./routers/teams/teams-router');
app.use('/api/teams', authenticate, teamsRouter);

// Socket helpers
const {
  addPlayerToQueue,
  removePlayerFromQueue,
  matchPlayersFromQueue
} = require('./sockets/queue');

const {
  createRoom,
  getRoom,
  getAllRooms,
  removeRoom,
  getPlayersInRoom
} = require('./sockets/rooms');

// Befor launching, implement node-rate-limiter-flexible to limit how many
// connections a user can make.

// Setting up sockets
io.on('connection', (socket) => {
  // Note that a rank can be added to the queue object to ensure proper matchmaking
  socket.on('enqueue', ({ id, format }, callback) => {
    const player = {
      player_id: id,
      socket_id: socket.id,
      format: format
    };

    const queueResult = addPlayerToQueue(player);
    if(queueResult !== null){
      // Create a room for the two players and send the room id to them
    }
  })

  socket.on('dequeue', ({ id, format }, callback) => {
    const player = {
      player_id: id,
      socket_id: socket.id,
      format: format
    };

    removePlayerFromQueue(player);
  })

  socket.on('join as player', ({ player, room }, callback) => {
    socket.join(room);
    socket.to(room).emit('init', { player: player, team: team });
  })

  socket.on('join as spectator', ({ spectator, room }, callback) => {
    socket.join(room);
    socket.to(room).emit('spectator join', spectator);
  })

  // Add gamelog handling to this event so that the backend sends the log to the client
  // which then sends it to the server to be stored as a string, and logged
  socket.on('forfeit', ({ player, room }, callback) => {
    socket.to(room).emit('player exit', { player: player, action: "forfeit" });
    socket.leave(room);
    removeRoom(room);
  })

  socket.on('player action', ({ room, action }, callback) => {
    socket.to(room).emit('opponent action', action);
  })

  socket.on('disconnect', () => {
    console.log('User has disconnected');
  })
});

// Declaring port and server.listen
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`\n=== Server listening on port ${PORT} ===\n`);
});

module.exports = {app, server};