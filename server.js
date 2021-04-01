const next = require('next');
const Hapi = require('@hapi/hapi');
const Debug = require('./helpers/debug');
const { nextHandlerWrapper } = require('./next-wrapper');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const server = new Hapi.Server({
  port,
});

// API Routes
const GameMap = require('./api/gamemap');
const JoinMap = require('./api/joinmap');

app.prepare().then(async () => {
  // APIs
  server.route({
    method: 'GET',
    path: '/{user}/map',
    handler: GameMap(app),
  });
  server.route({
    method: 'GET',
    path: '/{user}/join',
    handler: JoinMap(app),
  });

  // Next Specific Routes
  server.route({
    method: 'GET',
    path: '/_next/{p*}' /* next specific routes */,
    handler: nextHandlerWrapper(app),
  });

  server.route({
    method: '*',
    path: '/{p*}' /* catch all route */,
    handler: nextHandlerWrapper(app),
  });

  try {
    await server.start();
    Debug.log(`> Ready on http://localhost:${port}`);
  } catch (error) {
    Debug.error('Error starting server');
    Debug.error(error);
  }
});
