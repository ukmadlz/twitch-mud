const Boom = require('@hapi/boom');
const Debug = require('../helpers/debug');
const Map = require('./models/map');
const MapGenerator = require('./models/mapgenerator');

module.exports = (app, pathName, opts) => async (
  { params },
  h,
) => {
  // User settings
  const { user } = params;
  try {
    const mapExists = await new Map({
      user
    }).count();
    if (mapExists > 0) {
        const mapContents = await new Map({
          user
        }).fetch();
        const exit = mapContents.get('exit');
        const layout = mapContents.get('layout').layout;
        const mapGenerator = new MapGenerator();
        let playerPosition = mapGenerator.selectSafeStart(layout, exit);
        return h.response(playerPosition)
    }
  } catch(e) {
      Debug.error(e);
      return Boom.notFound('No map found.');
  } 
};