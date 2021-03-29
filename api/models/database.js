require('dotenv').config();
const Knex = require('knex');
const Bookshelf = require('bookshelf');

const knex = Knex({
  client: 'pg',
  connection: {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    charset: 'utf8',
  },
});

const bookshelf = Bookshelf(knex);

module.exports = {
  knex,
  bookshelf,
};
