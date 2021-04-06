const Ably = require('ably');
const Boom = require('@hapi/boom');
const Debug = require('../helpers/debug');
const Map = require('./models/map');
const MapGenerator = require('./models/mapgenerator');

const realtime = new Ably.Realtime(process.env.ABLY_API_KEY);

// @TODO: Use the user session data after TWITCH integration
const player = 'ukmadlz';

module.exports = (app, pathName, opts) => async (
  { params },
  h,
) => {
  // User settings
  const { user } = params;
  try {
    const mapExists = await new Map({
      user,
    }).count();
    if (mapExists > 0) {
      const mapContents = await new Map({
        user,
      }).fetch();
      const exit = mapContents.get('exit');
      const { layout } = mapContents.get('layout');
      const mapGenerator = new MapGenerator();
      const playerPosition = mapGenerator.selectSafeStart(layout, exit);
      const channel = realtime.channels.get(`game-${user}`);
      channel.publish('joining', JSON.stringify({
        map: user,
        player,
        playerPosition,
      }));
      return h.response(playerPosition);
    }
  } catch (e) {
    Debug.error(e);
    return Boom.notFound('No map found.');
  }
};
