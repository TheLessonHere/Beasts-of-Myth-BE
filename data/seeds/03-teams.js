
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('teams').del()
    .then(function () {
      // Inserts seed entries
      return knex('teams').insert([
        {user_id: 1,
          team_datastring: "format]/team_name/>beast_name>||slot#||)item)}move1,move2,move3,move4}]"},
          {user_id: 2,
            team_datastring: "format]/team_name/>beast_name>||slot#||)item)}move1,move2,move3,move4}]"},
      ]);
    });
};
