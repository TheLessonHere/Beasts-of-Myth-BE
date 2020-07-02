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
  removePlayerFromQueue
} = require('./sockets/queue');

const {
  createRoom,
  getRoom,
  getAllRooms,
  findRoomWithPlayer,
  removeRoom,
  getPlayersInRoom,
  addSpectatorToRoom,
  getSpectatorsInRoom
} = require('./sockets/rooms');

// Befor launching, implement node-rate-limiter-flexible to limit how many
// connections a user can make.

// Setting up sockets
io.on('connection', (socket) => {
  console.log("User has connected.");
  // Note that a rank can be added to the queue object to ensure proper matchmaking
  socket.on('enqueue', ({ id, username, format, team }, callback) => {
    const player = {
      player_id: id,
      socket_id: socket.id,
      username: username,
      format: format,
      team: team
    };

    const queueResult = addPlayerToQueue(player);
    if(queueResult !== null){
      const newRoom = createRoom(queueResult);
      io.to(queueResult.player1.socket_id).emit('room created', newRoom);
      io.to(queueResult.player2.socket_id).emit('room created', newRoom);
    }
  })

  socket.on('dequeue', ({ id }, callback) => {
    removePlayerFromQueue(id);
  })

  socket.on('join as player', ({ playerNum, player, room_id }, callback) => {
    socket.join(room_id);
    console.log(`User has joined room ${room_id}.`);
  })

  socket.on('join as spectator', ({ spectator, room_id }, callback) => {
    socket.join(room_id);
    addSpectatorToRoom({ room_id: room_id, spectator: spectator });
    io.to(room_id).emit('spectator join', spectator);
  })

  socket.on('see spectators', ({ room_id }, callback) => {
    const result = getSpectatorsInRoom(room_id);
    const resultString = JSON.stringify(result);
    io.to(socket.id).emit('spectator list', resultString);
  })

  // Add gamelog handling to this event so that the backend sends the log to the client
  // which then sends it to the server to be stored as a string, and logged
  socket.on('forfeit', ({ player, room_id }, callback) => {
    console.log('User has forfeited.');
    socket.to(room_id).emit('player exit', { playerInfo: player, action: "forfeit" });
    socket.leave(room_id);
    removeRoom(room_id);
  })

  socket.on('chat message', ({ room, message, username }, callback) => {
    const messageObj = {
      message: message,
      username: username
    }
    socket.to(room).emit('player message', messageObj);
  })

  socket.on('player action', ({ room, action }, callback) => {
    const players = getPlayersInRoom(room);
    console.log(players);
    if(players && players.player1.socket_id === socket.id){
      io.to(players.player2.socket_id).emit('opponent action', action);
    }
    else if(players && players.player2.socket_id === socket.id){
      io.to(players.player1.socket_id).emit('opponent action', action);
    } else {
      console.log('Error sending player action.')
    }
  })

  socket.on('post ko switch', ({ room, action }, callback) => {
    const players = getPlayersInRoom(room);
    console.log(players);
    if(players && players.player1.socket_id === socket.id){
      io.to(players.player2.socket_id).emit('opponent post ko', action);
    }
    else if(players && players.player2.socket_id === socket.id){
      io.to(players.player1.socket_id).emit('opponent post ko', action);
    } else {
      console.log('Error sending opponent post ko action.')
    }
  })

  socket.on('disconnect', () => {
    const result = findRoomWithPlayer(socket.id);
    if(result.room_id){
      const room = result.room_id;
      if(result.player1.socket_id === socket.id){
        console.log(`${result.player1.username} disconnected and loses by forfeit.`);
        socket.to(room).emit('player exit', { playerInfo: result.player1, action: "forfeit" });
        socket.leave(room);
        removeRoom(room);
      } else {
        console.log(`${result.player2.username} disconnected and loses by forfeit.`);
        socket.to(room).emit('player exit', { playerInfo: result.player2, action: "forfeit" });
        socket.leave(room);
        removeRoom(room);
      }
    } else {
      console.log(result.error);
    }
  })
});

// Declaring port and server.listen
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`\n=== Server listening on port ${PORT} ===\n`);
});

module.exports = {app, server};