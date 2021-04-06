const Ably = require('ably/promises');
const Debug = require('../helpers/debug');

/**
 * @param request The request param
 * @param h The response toolkit
 */
module.exports = async (request, h) => {
  if (!process.env.ABLY_API_KEY) {
    Debug.error('No config for Ably');
    return h.response({
      message: 'No config for Ably',
    }).code(500);
  }
  const client = new Ably.Realtime(process.env.ABLY_API_KEY);
  const tokenRequestData = await client.auth.createTokenRequest({ clientId: 'twitch-mud' });
  return h.response(tokenRequestData);
};
