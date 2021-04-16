const { bookshelf } = require('./database');

module.exports = bookshelf.model('Users',
  {
    tableName: 'users',
  });
