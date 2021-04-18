const Ably = require('ably');
const Boom = require('@hapi/boom');
const Debug = require('../helpers/debug');
const Map = require('./models/map');
const MapGenerator = require('./models/mapgenerator');
const Users = require('./models/users');

const realtime = new Ably.Realtime(process.env.ABLY_API_KEY);

module.exports = (app, pathName, opts) => async (
  { params, auth },
  h,
) => {
  const { credentials } = auth;
  // User settings
  const { user } = params;
  try {
    const mapExists = await new Map({
      user,
    }).count();
    const userExists = await new Users({
      id: credentials.id,
    }).count();
    if (mapExists > 0 && userExists > 0) {
      const mapContents = await new Map({
        user,
      }).fetch();
      const userContent = await new Users({
        id: credentials.id,
      }).fetch();
      const exit = mapContents.get('exit');
      const { layout } = mapContents.get('layout');
      const mapGenerator = new MapGenerator();
      const playerPosition = mapGenerator.selectSafeStart(layout, exit);
      const channel = realtime.channels.get(`game-${user}`);
      channel.publish('joining', JSON.stringify({
        map: user,
        player: userContent.get('twitch_name'),
        image: userContent.get('profile_image_url'),
        playerPosition,
      }));
      return h.response(playerPosition);
    }
  } catch (e) {
    Debug.error(e);
    return Boom.notFound('No map found.');
  }
};
