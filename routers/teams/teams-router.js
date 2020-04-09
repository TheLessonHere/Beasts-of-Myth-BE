const router = require('express').Router();
const db = require('../../auth/helpers');

const { validateUserId, validateTeamId, validateTeamDatastring } = require('../../auth/middleware');

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
        res.status(500).json({ error: "Server error saving team." });
    })
});

// Get all user teams

router.get('/:user_id', validateUserId, (req, res) => {
    const { user_id } = req.params;
    db.getUserTeams(user_id)
    .then(teams => {
        res.status(200).json(teams);
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ error: "Server error getting user teams." });
    })
});

// Edit user team

router.put('/:team_id', validateTeamId, validateTeamDatastring, (req, res) => {
    const { team_id } = req.params;
    const { team_datastring } = req.body;
    db.updateTeam(team_id, team_datastring)
    .then(team => {
        res.status(201).json(team);
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ error: "Server error editing team." });
    })
});

// Delete user team

router.delete('/:team_id', validateTeamId, (req, res) => {
    const { team_id } = req.params;
    db.deleteTeam(team_id)
    .then(response => {
        console.log(response);
        res.status(200).json({ message: "Team successfully deleted." });
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ error: "Server error deleting team." });
    })
});

module.exports = router;