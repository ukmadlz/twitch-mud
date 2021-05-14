const Boom = require('@hapi/boom');
const Debug = require('../helpers/debug');
const Users = require('./models/users');

module.exports = () => async (
  { auth },
  h,
) => {
  if (auth) {
    const { credentials } = auth;
    delete credentials.id;
    return h.response(credentials);
  }
  Debug.log('Not logged in trying to view record');
  return Boom.unauthorized('You cannot view me');
};
