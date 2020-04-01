const router = require('express').Router();
const db = require('../../auth/helpers');

const { validateUserId, validateTeamDatastring } = require('../../auth/middleware');

// Create user team

router.post('/:user_id', validateUserId, validateTeamDatastring, (req, res) => {
    const { user_id } = req.params;
    const { team_datastring } = req.body;
    const team = {
        user_id: user_id,
        team_datastring: team_datastring
    };
    db.addTeam(team)
    .then(team => {
        res.status(201).json(team);
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ error: "Server error saving team." })
    })
});

// Get all user teams

// Edit user team

// Delete user team