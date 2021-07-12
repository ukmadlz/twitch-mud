const Ably = require('ably');
const Boom = require('@hapi/boom');
const Debug = require('../helpers/debug');
const Map = require('./models/map');
const MapGenerator = require('./models/mapgenerator');
const Users = require('./models/users');
const Players = require('./models/players');

const realtime = new Ably.Realtime(process.env.ABLY_API_KEY);
const joinGame = async (user, userId) => {
  try {
    const mapExists = await new Map({
      user,
    }).count();
    const userExists = await new Users({
      id: userId,
    }).count();
    if (mapExists > 0 && userExists > 0) {
      const mapContents = await new Map({
        user,
      }).fetch();
      const userContent = await new Users({
        id: userId,
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
      return true;
    }
  } catch (e) {
    Debug.error(e);
    return false;
  }
};

const joinGameRoute = (app, pathName, opts) => async (
  { params, auth },
  h,
) => {
  const { credentials } = auth;
  // User settings
  const { user } = params;
  // Make the call
  const joined = joinGame(user, credentials.id);
  if (joined) {
    return h.redirect(`/${user}/controller`);
  }
  return Boom.notFound('No map found.');
};

module.exports = {
  joinGame,
  joinGameRoute,
};
