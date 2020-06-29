
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('users').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        {username: 'User1',
        password: 'FirstUser',
        profile_img: null,
        wins: 0,
        losses: 0,
        connections: 0},
        {username: 'User2',
        password: 'SecondUser',
        profile_img: null,
        wins: 0,
        losses: 0,
        connections: 0}
      ])
    });
};
