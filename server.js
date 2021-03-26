const next = require('next')
const Hapi = require('@hapi/hapi')
const { pathWrapper, nextHandlerWrapper } = require('./next-wrapper')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const server = new Hapi.Server({
  port,
})

// API Routes
const GameMap = require('./api/gamemap');

app.prepare().then(async () => {
  // Game map
  server.route({
    method: 'GET',
    path: '/map',
    handler: GameMap(app),
  });

  // Next Specific Routes
  server.route({
    method: 'GET',
    path: '/_next/{p*}' /* next specific routes */,
    handler: nextHandlerWrapper(app),
  })

  server.route({
    method: '*',
    path: '/{p*}' /* catch all route */,
    handler: nextHandlerWrapper(app),
  })

  try {
    await server.start()
    console.log(`> Ready on http://localhost:${port}`)
  } catch (error) {
    console.log('Error starting server')
    console.log(error)
  }
})
