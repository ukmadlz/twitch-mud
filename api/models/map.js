const { bookshelf } = require('./database');

module.exports = bookshelf.model('Map',
  {
    tableName: 'map',
  });
