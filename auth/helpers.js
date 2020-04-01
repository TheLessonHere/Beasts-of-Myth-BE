const db = require('../data/dbConfig.js');

module.exports = {
  addUser,
  findUsers,
  findUserByUsername,
  findUserById,
  updateUser,
  deleteUser,
  addTeam,
  findTeamById,
  getUserTeams,
  updateTeam,
  deleteTeam,
  sendMessage,
  getMessages,
};

// User helpers

async function addUser(user) {
  const [ new_id ] = await db('users').insert(user);
  return findUserById(new_id);
}

function findUsers() {
  return db('users').select('*');
}

function findUserByUsername(username) {
  return db('users')
    .where({ username })
    .first();
}

function findUserById(user_id) {
  return db('users')
    .where({ user_id })
    .first();
}

async function updateUser(user_id, changes) {
  const newInfo = {...changes};
  const userInfo = await findUserById(user_id);
  const updatedInfo = {
    ...userInfo,
    ...newInfo
  }

  return db('users')
    .where({ user_id })
    .update(updatedInfo);
}

function deleteUser(user_id) {
  return db('users')
    .where({ user_id })
    .del();
}

// Team helpers

async function addTeam(team) {
  const [ new_id ] = await db('teams').insert(team);
  return findTeamById(new_id);
}

function findTeamById(team_id) {
  return db('teams')
  .where({ team_id })
  .first();
}

function getUserTeams(user_id) {
  return db('teams')
  .select('*')
  .where('user_id', user_id)
  .orderBy('team_id');
}

async function updateTeam(team_id, team_datastring) {
  const teamData = await findTeamById(team_id);
  const updatedTeam = {
    ...teamData,
    team_datastring: team_datastring
  }

  return db('teams')
    .where({ team_id })
    .update(updatedTeam);
}

function deleteTeam(team_id) {
  return db('teams')
    .where({ team_id })
    .del();
}

// Message helpers

function sendMessage(from_id, to_id, message) {
  const newMessage = {
    from_id: from_id,
    to_id: to_id,
    message: message
  }
  return db('messages').insert(newMessage);
}

function getMessages(user_id, friend_id) {
  return db('messages')
  .where(function(){
    this.where('from_id', user_id).orWhere('from_id', friend_id)
  })
  .andWhere(function(){
    this.where('to_id', user_id).orWhere('to_id', friend_id)
  })
  .select('message')
  .orderBy('message_id');
}