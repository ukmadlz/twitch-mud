const userTable = 'users';
exports.up = (knex) => knex.schema
  .hasTable(userTable).then((exists) => {
    if (exists) {
      return knex.schema.hasColumn(userTable, 'display_name')
        .then((exists) => {
          if (!exists) {
            return knex.schema.table(userTable, (table) => {
              table.string('display_name', 255).notNullable();
            });
          }
          return true;
        })
        .then(() => knex.schema.hasColumn(userTable, 'profile_image_url'))
        .then((exists) => {
          if (!exists) {
            return knex.schema.table(userTable, (table) => {
              table.string('profile_image_url', 255);
            });
          }

          return true;
        })
        .then(() => knex.schema.hasColumn(userTable, 'twitch_id'))
        .then((exists) => {
          if (!exists) {
            return knex.schema.table(userTable, (table) => {
              table.integer('twitch_id').notNullable();
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
      return knex.schema.hasColumn(userTable, 'display_name')
        .then((exists) => {
          if (exists) {
            return knex.schema.table(userTable, (table) => {
              table.dropColumn('display_name');
            });
          }
          return true;
        })
        .then(() => knex.schema.hasColumn(userTable, 'profile_image_url'))
        .then((exists) => {
          if (exists) {
            return knex.schema.table(userTable, (table) => {
              table.dropColumn('profile_image_url');
            });
          }
          return true;
        })
        .then(() => knex.schema.hasColumn(userTable, 'twitch_id'))
        .then((exists) => {
          if (exists) {
            return knex.schema.table(userTable, (table) => {
              table.dropColumn('twitch_id');
            });
          }
          return true;
        });
    }
    return true;
  });
