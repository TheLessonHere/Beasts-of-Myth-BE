const jwt = require('jsonwebtoken');
const secret = require('../config/secrets');
const db = require('./dbhelpers');

function authenticate (req, res, next) {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, secret.jwtSecret, (err, decodedToken) => {
      if (err) {
        // token expired or is invalid
        res.status(401).json({ message: 'You shall not pass!' });
      } else {
        // token is valid
        req.user = { username: decodedToken.username };
        next();
      }
    });
  } else {
    res.status(400).json({ message: 'You shall not pass!' });
  }
};

function checkUserCreds(req, res, next) {
  if (!req.body.username || !req.body.password)
    res.status(400).json({ message: 'Request missing required information' });
  else next();
};

function checkUserExists(req, res, next) {
  const username = req.body.username;
  console.log(username);
    db.findUserByUsername(username)
    .then(user => {
      if (user && user.username === username) {
        res.status(401).json({ message: 'Username already in use' });
      } else {next();}
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "Server error checking if user exists." })
    })
};

function validateUserId(req, res, next) {
  const { user_id } = req.params;
  if(user_id) {
      db.findUserById(user_id)
      .then(user => {
          if(user) {
              next();
          } else {
              res.status(404).json({ error: "Invalid user id" });
          }
      })
      .catch(err => {
          console.log(err);
          res.status(500).json({ error: "Server error getting user by id" })
      });
  } else {
      next();
  }
};

function validateTeamId(req, res, next) {
  const { team_id } = req.params;
  if(team_id) {
    db.findTeamById(team_id)
    .then(team => {
      if(team) {
        next();
      } else {
        res.status(404).json({ error: "Invalid team id" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: "Server error getting team by id" })
    });
  } else {
    next();
  }
};

function validateTeamDatastring(req, res, next) {
  next();
};

module.exports = {
  authenticate,
  checkUserCreds,
  checkUserExists,
  validateUserId,
  validateTeamId,
  validateTeamDatastring
}