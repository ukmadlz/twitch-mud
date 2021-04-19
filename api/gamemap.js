const Debug = require('../helpers/debug');
const Map = require('./models/map');
const MapGenerator = require('./models/mapgenerator');
const Players = require('./models/players');

module.exports = (app, pathName, opts) => async (
  { params },
  h,
) => {
  // User settings
  const { user } = params;
  // Defaults
  let mapType = 'Village';
  let mapFactor = 0;
  let exit = {};
  let layout = [];
  let players = {};
  // Check for an existing instance
  try {
    const mapExists = await new Map({
      user,
    }).count();
    if (mapExists > 0) {
      const mapContents = await new Map({
        user,
      }).fetch();
      mapType = mapContents.get('map_type');
      exit = mapContents.get('exit');
      layout = mapContents.get('layout').layout;
      try {
        const playersContent = await new Players({
          map_id: mapContents.get('id'),
        }).fetchAll({
          withRelated: ['users'],
        });
        await playersContent.map((player) => {
          const {
            position,
            users,
          } = player.toJSON();
          players[users.twitch_name] = {
            playerPosition: position,
            image: users.profile_image_url,
          };
          return true;
        });
      } catch (e) {
        Debug.error(e);
      }
    } else {
      // Create map
      const mapGenerator = new MapGenerator();
      const mapTypeChoice = MapGenerator.getRandomInt(3);
      switch (mapTypeChoice) {
        case 1:
          mapType = 'Forest';
          mapFactor = 0.1;
          break;
        case 2:
          maptype = 'Village';
          mapFactor = 0.3;
          break;
        case 3:
        default:
          mapType = 'Castle';
          mapFactor = 0.8;
      }
      // Size of the game area
      const gameSize = 30;
      // Creates the initial layout
      layout = await mapGenerator.generateLayout(gameSize, mapFactor);
      try {
        // Fill in tiny spaces
        layout = await mapGenerator.fillSingleBlanks(layout);
        // remove big blocks of wall
        layout = await mapGenerator.deblock(layout);
      } catch (e) {
        Debug.error(e);
      }

      // Add an exit
      exit = mapGenerator.selectExit(layout);

      // Save the map
      try {
        const mapObject = {
          user,
          map_type: mapType,
          layout: { layout },
          exit,
        }
        await new Map(mapObject).save();
      } catch (e) {
        Debug.error(e);
      }
    }
  } catch (e) {
    Debug.error(e);
  }
  return h.response({
    mapType,
    layout,
    monsters: [],
    players,
    exit,
  });
};
