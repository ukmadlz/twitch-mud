const Bell = require('@hapi/bell');
const Cookie = require('@hapi/cookie');
const Debug = require('../helpers/debug');
const Users = require('./models/users');

module.exports = async (server) => {
  // Register Bell
  await server.register(Bell);
  await server.register(Cookie);
  server.auth.strategy('session', 'cookie', {
    cookie: {
      password: process.env.TWITCH_COOKIE,
      isSecure: false,
    },
    redirectTo: '/login',
    validateFunc: async (request, sesson) => ({ valid: true }),
  });
  const redirectUri = process.env.TWITCH_CALLBACK || `http://localhost:${(parseInt(process.env.PORT, 10) || 3000)}/login`
  Debug.log(redirectUri);
  server.auth.strategy('twitch', 'bell', {
    // implementation is broken in @hapi/bell, Client-ID header must be included in each request
    provider: {
      name: 'twitch',
      protocol: 'oauth2',
      useParamsAuth: true,
      auth: 'https://id.twitch.tv/oauth2/authorize',
      token: 'https://id.twitch.tv/oauth2/token',
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
      },
      scope: ['user:read:email'],
      scopeSeparator: ' ',
      async profile(credentials, params, get) {
        const profileResponse = await get(
          'https://api.twitch.tv/helix/users',
          {},
        );
        credentials.profile = profileResponse.data[0];
      },
    },
    password: process.env.TWITCH_COOKIE,
    clientId: process.env.TWITCH_CLIENT_ID,
    clientSecret: process.env.TWITCH_CLIENT_SECRET,
    isSecure: false,
    location: redirectUri,
  });
  server.auth.default('session');

  // APIs
  server.route({
    method: ['GET', 'POST'], // Must handle both GET and POST
    path: '/login', // The callback endpoint registered with the provider
    options: {
      auth: {
        mode: 'try',
        strategy: 'twitch',
      },
      handler: async (request, h) => {
        if (!request.auth.isAuthenticated) {
          Debug.error(request.auth.error);
          return `Authentication failed due to: ${request.auth.error.message}`;
        }
        const {
          id,
          login,
          display_name,
          profile_image_url,
        } = request.auth.credentials.profile;
        const userExists = await new Users({
          twitch_id: id,
        }).count();
        let userData = {};
        if (userExists < 1) {
          userData = await new Users({
            twitch_name: login,
            display_name,
            profile_image_url,
            twitch_id: id,
          }).save();
        } else {
          userData = await new Users({
            twitch_id: id,
          }).fetch();
        }
        request.cookieAuth.set(userData.toJSON());
        return h.redirect('/game');
      },
    },
  });
  // Logout
  server.route({
    method: ['GET', 'POST'],
    path: '/logout',
    options: {
      handler: (request, h) => {
        request.cookieAuth.clear();
        return h.redirect('/');
      },
    },
  });
};
