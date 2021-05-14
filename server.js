const next = require('next');
const Hapi = require('@hapi/hapi');
const pino = require('hapi-pino');
const Debug = require('./helpers/debug');
const { nextHandlerWrapper } = require('./next-wrapper');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const server = new Hapi.Server({
  port,
});

// API Routes
const Me = require('./api/me');
const GameMap = require('./api/gamemap');
const JoinMap = require('./api/joinmap');
const MovePlayer = require('./api/moveplay');
const AttackPlayer = require('./api/attackplay');
const AblyTokenRequest = require('./api/ablyTokenRequest');
const Auth = require('./api/auth');

app.prepare().then(async () => {
  await server.register({
    plugin: pino,
    options: {
      prettyPrint: false,
      // Redact Authorization headers, see https://getpino.io/#/docs/redaction
      redact: ['req.headers.authorization'],
      mergeHapiLogData: true,
    },
  });
  await Auth(server);
  server.route({
    method: 'GET',
    path: '/api/me',
    handler: Me(app),
  });
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
  server.route({
    method: ['GET', 'POST'],
    path: '/{user}/move/{direction}',
    handler: MovePlayer(app),
  });
  server.route({
    method: ['GET', 'POST'],
    path: '/{user}/attack/{direction}',
    handler: AttackPlayer(app),
  });
  server.route({
    method: 'GET',
    path: '/api/ablyTokenRequest',
    handler: AblyTokenRequest,
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
