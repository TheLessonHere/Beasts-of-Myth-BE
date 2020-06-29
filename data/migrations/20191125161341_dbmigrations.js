exports.up = function(knex) {
    return knex.schema
    .createTable('users', users => {
        users.increments('user_id')
        .unique();
        users
        .string('username', 25)
        .notNullable()
        .unique();
        users
        .string('password', 255)
        .notNullable();
        users
        .string('profile_img', 255);
        users
        .integer('wins', 255)
        .notNullable()
        .defaultTo(0);
        users
        .integer('losses', 255)
        .notNullable()
        .defaultTo(0)
        users
        .integer('connections', 2)
        .notNullable()
        .defaultTo(0);
      })
    .createTable('teams', teams => {
        teams.increments('team_id')
        .unique();
        teams
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
        teams
        .string('team_datastring', 1000)
        .notNullable();
    })
    .createTable('messages', messages => {
        messages.increments('message_id')
        .unique();
        messages
        .integer('from_id')
        .unsigned()
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
        messages
        .integer('to_id')
        .unsigned()
        .notNullable()
        .references('user_id')
        .inTable('users')
        .onUpdate('CASCADE')
        .onDelete('CASCADE');
        messages
        .string('message', 255)
        .notNullable();
    })
};

exports.down = function(knex) {
    return knex.schema
    .dropTableIfExists('messages')
    .dropTableIfExists('teams')
    .dropTableIfExists('users');
};
