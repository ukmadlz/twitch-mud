const userTable = 'users';
const playerTable = 'players';
exports.up = (knex) => knex.schema
  .hasTable(userTable).then((exists) => {
    if (!exists) {
      return knex.schema.createTable(userTable, (table) => {
        table.increments('id');
        table.string('twitch_name', 255).notNullable();
        table.timestamps(null, true);
      });
    }
    return true;
  })
  .then(() => knex.schema
    .hasTable(playerTable).then((exists) => {
      if (!exists) {
        return knex.schema.createTable(playerTable, (table) => {
          table.increments('id');
          table.integer('map_id')
            .index()
            .references('id')
            .inTable('map');
          table.integer('user_id')
            .index()
            .references('id')
            .inTable('users');
          table.json('position').notNullable();
          table.timestamps(null, true);
        });
      }
    }));

exports.down = (knex) => knex.schema
  .hasTable(userTable).then((exists) => {
    if (!exists) {
      return knex.schema
        .dropTable(userTable);
    }
    return true;
  })
  .then(() => knex.schema
    .hasTable(playerTable).then((exists) => {
      if (!exists) {
        return knex.schema
          .dropTable(playerTable);
      }
      return true;
    }));
