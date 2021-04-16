const next = require('next');
const Bell = require('@hapi/bell');
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
const AblyTokenRequest = require('./api/ablyTokenRequest');

app.prepare().then(async () => {
  // Register Bell
  await server.register(Bell);
  await server.auth.strategy('twitch', 'bell', {
    provider: 'twitch',
    password: process.env.TWITCH_COOKIE,
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    isSecure: !(process.env.NODE_ENV !== 'production'),
    scope: ['user_read', 'channel_read'],
  });

  // APIs
  server.route({
    method: ['GET', 'POST'], // Must handle both GET and POST
    path: '/login', // The callback endpoint registered with the provider
    options: {
      auth: {
        mode: 'try',
        strategy: 'twitch',
      },
      handler(request, h) {
        if (!request.auth.isAuthenticated) {
          Debug.error(request.auth.error);
          return `Authentication failed due to: ${request.auth.error.message}`;
        }

        // Perform any account lookup or registration, setup local session,
        // and redirect to the application. The third-party credentials are
        // stored in request.auth.credentials. Any query parameters from
        // the initial request are passed back via request.auth.credentials.query.

        return h.redirect('/game');
      },
    },
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
