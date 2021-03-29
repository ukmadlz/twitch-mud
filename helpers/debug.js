const Debug = require('debug');
const Package = require('../package.json');

const { name } = Package;

// Supported logging states for later
const LOGGING_TYPES = ['log', 'info', 'warning', 'error'];

const debug = {};

// Build it
LOGGING_TYPES.forEach((type) => {
  debug[type] = Debug(`${name}:${type}`);
});

module.exports = debug;
