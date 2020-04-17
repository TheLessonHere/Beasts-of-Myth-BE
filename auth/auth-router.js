const router = require('express').Router();
const bcrypt = require('bcryptjs');

const db = require('./dbhelpers');
const generateToken = require('./generateToken');
const { checkUserCreds, checkUserExists } = require('./middleware');

router.post('/register', checkUserCreds, checkUserExists, (req, res) => {
  const user = req.body;
  const hash = bcrypt.hashSync(user.password, 12);
  user.password = hash;

  db.addUser(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      console.log(error)
      res.status(500).json({ error: "Server error adding user." });
    });
});

router.post('/login', (req, res) => {
  let { username, password } = req.body;

  db.findUserByUsername(username)
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        const token = generateToken(user);

        res.status(200).json({
          message: `Welcome ${user.username}!`,
          user_id: user.user_id,
          token
        });
      } else {
        res.status(401).json({ message: 'You are not authorized to view this data.' });
      }
    })
    .catch(error => {
      console.log(error)
      res.status(500).json({ error: "Server error authenticating login." });
    });
});

module.exports = router;