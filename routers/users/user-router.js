const router = require('express').Router();
const db = require('../../auth/helpers');

const { validateUserId } = require('../../auth/middleware');

// Get all users

router.get('/', (req, res) => {
    db.findUsers()
    .then(users => {
        res.status(200).json(users);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: "Server error getting users" })
    });
});

// Get individual user

router.get('/:user_id', validateUserId, (req, res) => {
    const { user_id } = req.params;
    db.findUserById(user_id)
    .then(user => {
        res.status(200).json(user);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: "Server error getting user by id" })
    });
});

// Delete user

router.delete('/:user_id', validateUserId, (req, res) => {
    const { user_id } = req.params;
    db.removeUser(user_id)
    .then(response => {
        res.status(200).json({ message: `User with id: ${user_id} successfully deleted` });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: "Server error removing user" });
    });
});

module.exports = router;