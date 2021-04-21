const Ably = require('ably');
const Boom = require('@hapi/boom');
const Debug = require('../helpers/debug');
const Map = require('./models/map');
const MapGenerator = require('./models/mapgenerator');
const Users = require('./models/users');
const Players = require('./models/players');
const { __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED } = require('react');
const { default: next } = require('next');

const realtime = new Ably.Realtime(process.env.ABLY_API_KEY);

module.exports = (app, pathName, opts) => async (
  { params, auth },
  h,
) => {
  // User settings
  const { credentials } = auth;
  // URL params
  const { user, direction } = params;

  // Check it's a valid direction
  const validDirections = ['up', 'down', 'left', 'right'];
  if (!validDirections.includes(direction.toLowerCase())) {
    const errMessage = 'Invalid direction passed';
    Debug.error(errMessage);
    return Boom.badRequest(errMessage);
  }

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
      let playerPosition = {};
      try {
        const playerContent = await new Players({
          map_id: mapContents.get('id'),
          user_id: credentials.id,
        }).fetch({
          withRelated: ['users'],
        });
        const { position } = playerContent.toJSON();
        const mapGenerator = new MapGenerator();
        const { layout } = mapContents.get('layout');
        const surroundings = mapGenerator.getSurrounding(layout, position.x, position.y);
        let nextBlock = {};
        switch (direction) {
          case 'up':
            nextBlock = surroundings.n();
            break;
          case 'down':
            nextBlock = surroundings.s();
            break;
          case 'left':
            nextBlock = surroundings.w();
            break;
          case 'right':
            nextBlock = surroundings.e();
            break;
          default:
            Debug.error('Somehow no direction made it through');
        }
        // Check we can go to the block
        if (!nextBlock.wall) {
          const { x, y } = nextBlock;
          playerPosition = {
            x,
            y,
          };
          await new Players({
            id: playerContent.get('id'),
            position: playerPosition,
          }).save();
          const channel = realtime.channels.get(`game-${user}`);
          const {
            users,
          } = playerContent.toJSON();
          channel.publish('moving', JSON.stringify({
            map: user,
            player: users.twitch_name,
            image: users.profile_image_url,
            playerPosition,
          }));
        } else {
          return Boom.badRequest('Invalid move');
        }
      } catch (e) {
        Debug.error(e);
        return Boom.notFound('Player not in game.');
      }
      return h.response(playerPosition);
    }
  } catch (e) {
    Debug.error(e);
    return Boom.notFound('No map found.');
  }
};
