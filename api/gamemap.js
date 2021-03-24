const generateLayout = async (size) => {
  const layout = []
  //  Build the rows
  for(let x = 0; x < size; x = x + 1) {
    layout[x] = [];
    // Build the columns
    for(let y = 0; y < size; y = y + 1) {
      let wall = false;
      // Add the walls
      if ((x == 0 || x == (size - 1)) 
        || (y == 0 || y == (size - 1))) {
        wall = true;
      } else {
        // Generate random wall
        let random = 0.2;
        if(layout[x-1][y].wall || layout[x][y-1].wall) {
          random = 0.5
        }
        if(Math.random() < random) {
          wall = true;
        }
      }
      layout[x][y] = {
        wall,
      }
    }
  }
  return layout
}

module.exports = (app, pathName, opts) => async (
  { raw, query, params },
  h
) => {
    const layout = await generateLayout(20);
    return h.response({
      layout,
      'monsters': [],
      'exit': {
        x: 2,
        y: 2,
      }
    })
  }
