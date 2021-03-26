const generateLayout = async (size) => {
  const layout = []
  //  Build the rows
  for(let x = 0; x < size; x = x + 1) {
    layout[x] = [];
    // Build the columns
    for(let y = 0; y < size; y = y + 1) {
      let wall = false;
      let destructable = false;
      // Add the walls
      if ((x == 0 || x == (size - 1)) 
        || (y == 0 || y == (size - 1))) {
        wall = true;
      } else {
        // Generate random wall
        let random = 0.2;
        if(layout[x-1][y].wall || layout[x][y-1].wall) {
          random = 0.5

          // 0 wall if will make a square
          if (layout[x-1][y-1].wall && layout[x-1][y].wall && layout[x][y-1].wall) {
            random = 0;
          }
        }
        if(Math.random() < random) {
          wall = true;
          // Can you blow the wall up!
          if(Math.random() < 0.5) {
            destructable = true;
          }
        }
      }
      layout[x][y] = {
        wall,
        destructable,
      }
    }
  }
  return layout
}

const fillSingleBlank = (layout) => {
  return layout.map((row, x) => {
    return row.map((column, y) => {
      // if((layout[x][y+1] && layout[x][y+1].wall) 
      //   && (layout[x+1][y] && layout[x+1][y].wall)
      //   && (layout[x][y-1] && layout[x][y-1].wall)
      //   && (layout[x-1][y] && layout[x-1][y].wall)) {
      //     column.wall = true
      //   }
      return column;
    });
  });
}

module.exports = (app, pathName, opts) => async (
  data,
  h
) => {
    // Creates the initial layout
    let layout = await generateLayout(20);
    // Fill in tiny spaces
    layout = await fillSingleBlank(layout);
    return h.response({
      layout,
      'monsters': [],
      'exit': {
        x: 2,
        y: 2,
      }
    })
  }
