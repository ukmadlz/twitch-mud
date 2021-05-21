const userTable = 'users';
exports.up = (knex) => knex.schema
  .hasTable(userTable).then((exists) => {
    if (exists) {
      return knex.schema.hasColumn(userTable, 'twitch_id')
        .then((columnExists) => {
          if (columnExists) {
            return knex.schema.alterTable(userTable, (t) => {
              t.unique('twitch_id');
            });
          }
          return true;
        });
    }
    return true;
  });

exports.down = (knex) => knex.schema
  .hasTable(userTable).then((exists) => {
    if (exists) {
      return knex.schema.hasColumn(userTable, 'twitch_id')
        .then((columnExists) => {
          if (columnExists) {
            return knex.schema.table(userTable, (table) => {
              table.dropUnique('twitch_id');
            });
          }
          return true;
        });
    }
    return true;
  });
