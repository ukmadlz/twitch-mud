require('dotenv').config();
const Knex = require('knex');
const Bookshelf = require('bookshelf');
const KnexConf = require('../../knexfile')

const knex = Knex(KnexConf[process.env.NODE_ENV]);

const bookshelf = Bookshelf(knex);

module.exports = {
  knex,
  bookshelf,
};
