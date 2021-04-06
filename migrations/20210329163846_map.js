const tableName = 'map';
exports.up = (knex) => knex.schema
  .hasTable(tableName).then((exists) => {
    if (!exists) {
      return knex.schema.createTable(tableName, (table) => {
        table.increments('id');
        table.string('user', 255).notNullable();
        table.string('map_type', 255).notNullable();
        table.json('layout').notNullable();
        table.json('exit').notNullable();
        table.timestamps(null, true);
      });
    }
    return true;
  });

exports.down = (knex) => knex.schema
  .hasTable(tableName).then((exists) => {
    if (!exists) {
      return knex.schema
        .dropTable(tableName);
    }
    return true;
  });
