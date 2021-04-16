const { bookshelf } = require('./database');

module.exports = bookshelf.model('Players',
  {
    tableName: 'players',
  });
