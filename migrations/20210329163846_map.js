const tableName = 'map';
exports.up = function (knex) {
  return knex.schema
    .hasTable(tableName).then((exists) => {
      if (!exists) {
        return knex.schema.createTable(tableName, (table) => {
          table.increments('id');
          table.string('user', 255).notNullable();
          table.string('map_type', 255).notNullable();
          table.json('layout').notNullable();
          table.json('exit').notNullable();
          table.timestamps();
        });
      }
    });
};

exports.down = function (knex) {
  return knex.schema
    .hasTable(tableName).then((exists) => {
      if (!exists) {
        return knex.schema
          .dropTable(tableName);
      }
    });
};
