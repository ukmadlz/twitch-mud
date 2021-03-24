module.exports = (app, pathName, opts) => async (
  { raw, query, params },
  h
) => {
    return h.response({
      'layout': [
        // Row 1
        [
          {
            wall: true,
          },
          {
            wall: true,
          },
          {
            wall: true,
          },
          {
            wall: true,
          },
          {
            wall: true,
          },
        ],
        // Row 2
        [
          {
            wall: true,
          },
          {
            wall: false,
          },
          {
            wall: false,
          },
          {
            wall: false,
          },
          {
            wall: true,
          },
        ],
        // Row 3
        [
          {
            wall: true,
          },
          {
            wall: true,
          },
          {
            wall: false,
          },
          {
            wall: true,
          },
          {
            wall: true,
          },
        ],
        // Row 4
        [
          {
            wall: true,
          },
          {
            wall: false,
          },
          {
            wall: false,
          },
          {
            wall: false,
          },
          {
            wall: true,
          },
        ],
        // Row 5
        [
          {
            wall: true,
          },
          {
            wall: true,
          },
          {
            wall: true,
          },
          {
            wall: true,
          },
          {
            wall: true,
          },
        ],
      ],
      'monsters': [],
      'exit': {
        x: 2,
        y: 2,
      }
    })
  }
