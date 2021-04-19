const { bookshelf } = require('./database');
const Users = require('./users');
const Map = require('./map');

module.exports = bookshelf.model('Players',
  {
    tableName: 'players',
    users() {
      return this.belongsTo(Users);
    },
    maps() {
      return this.belongsTo(Map);
    },
  });
