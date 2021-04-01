const Debug = require('../helpers/debug');
const Map = require('./models/map');
const MapGenerator = require('./models/mapgenerator');

module.exports = (app, pathName, opts) => async (
  { params },
  h,
) => {
  const { user } = params;
  // Check for an existing instace
  try {
    const mapData = await new Map({
      user
    }).count({
      debug: true,
    });
    Debug.info(mapData);
  } catch(e) {
    Debug.error(e);
  }
  const mapGenerator = new MapGenerator();
  let mapType = 'Village';
  let mapFactor = 0;
  const mapTypeChoice = mapGenerator.getRandomInt(3);
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
  const gameSize = 20;
  // Creates the initial layout
  let layout = await mapGenerator.generateLayout(gameSize, mapFactor);
  try {
    // Fill in tiny spaces
    layout = await mapGenerator.fillSingleBlanks(layout);
    // remove big blocks of wall
    layout = await mapGenerator.deblock(layout);
  } catch (e) {
    Debug.error(e);
  }

  // Add an exit
  const exit = mapGenerator.selectExit(layout);
  return h.response({
    mapType,
    layout,
    monsters: [],
    exit,
  });
};
