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
  socket.on('forfeit', ({ player, room }, callback) => {
    socket.to(room).emit('player exit', { player: player, action: "forfeit" });
    socket.leave(room);
    removeRoom(room);
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

  socket.on('crit roll', ({room, playerNum, critRolls}, callback) => {
    const rollCrit = (critRolls) => {
      const getRandomInt = (min, max) => {
          min = Math.ceil(min);
          max = Math.floor(max);
          return Math.floor(Math.random() * (max - min + 1)) + min;
      }

      switch(critRolls){
          case 0:
              return false;
          case 1:
              let randomInt25 = getRandomInt(1, 4);
              if(randomInt25 === 1){
                  randomInt25 = true;
              } else {
              randomInt25 = false;
              };
              return randomInt25;
          case 2:
              let randomInt50 = getRandomInt(1, 2);
              if(randomInt50 === 1){
                  randomInt50 = true;
              } else {
              randomInt50 = false;
              };
              return randomInt50;
          case 3:
              let randomInt75 = getRandomInt(1, 4);
              if(randomInt75 === 1){
                  randomInt75 = false;
              } else {
              randomInt75 = true;
              };
              return randomInt75;
          case 4:
              return true;
      }
    }

    const critRoll = rollCrit(critRolls);
    const result = {
      critResult: critRoll,
      playerNum: playerNum
    }
    io.to(room).emit(`crit result`, result);
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
    console.log('User has disconnected');
  })
});

// Declaring port and server.listen
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`\n=== Server listening on port ${PORT} ===\n`);
});

module.exports = {app, server};