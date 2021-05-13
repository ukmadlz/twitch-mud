const Ably = require('ably');
const Boom = require('@hapi/boom');
const Debug = require('../helpers/debug');
const Map = require('./models/map');
const MapGenerator = require('./models/mapgenerator');
const Users = require('./models/users');
const Players = require('./models/players');

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
      let playerPosition = {};
      try {
        const playerContent = await new Players({
          map_id: mapContents.get('id'),
          user_id: userContent.get('id'),
        }).fetch();
        const { position } = playerContent.toJSON();
        playerPosition = position;
      } catch (e) {
        Debug.error(e);
        const exit = mapContents.get('exit');
        const { layout } = mapContents.get('layout');
        const mapGenerator = new MapGenerator();
        playerPosition = mapGenerator.selectSafeStart(layout, exit);
        await new Players({
          map_id: mapContents.get('id'),
          user_id: userContent.get('id'),
          position: playerPosition,
        }).save();
        const channel = realtime.channels.get(`game-${user}`);
        channel.publish('joining', JSON.stringify({
          map: user,
          player: userContent.get('twitch_name'),
          image: userContent.get('profile_image_url'),
          playerPosition,
        }));
      }
      return h.redirect(`/${user}/controller`);
    }
  } catch (e) {
    Debug.error(e);
    return Boom.notFound('No map found.');
  }
};
