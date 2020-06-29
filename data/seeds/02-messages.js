
exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('messages')
    .then(function () {
      // Inserts seed entries
      return knex('messages').insert([
        {from_id: 1,
          to_id: 2,
          message: "Hello"},
          {from_id: 2,
            to_id: 1,
            message: "Hi"},
      ]);
    });
};
