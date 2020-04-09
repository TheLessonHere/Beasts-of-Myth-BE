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

// Setting up sockets
io.on('connection', (socket) => {
  console.log('New connection to the server');

  socket.on('disconnect', () => {
    console.log('User has disconnected');
  })
});

// Declaring port and server.listen
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n=== Server listening on port ${PORT} ===\n`);
});

module.exports = {app, server};