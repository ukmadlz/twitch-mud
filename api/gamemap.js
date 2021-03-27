const getSurrounding = (layout, x, y) => {
  // console.log(x, y, layout[y][x]);
  try {
    current = layout[y][x];
    if (current == null)
      return null;
  } catch (e) {
    return null;
  }
  const position = { 
    x: current.x,
    y: current.y,
    wall: current.wall,
    destructable: current.destructable,
   };
  const yMax = layout.length - 1;
  const xMax = layout[0].length - 1;

  if (y > 0)
    position.n = () => getSurrounding(layout, x, y-1);
  
  if (y < yMax)
    position.s = () => getSurrounding(layout, x, y+1);

  if (x > 0)
    position.w = () => getSurrounding(layout, x-1, y);
  
  if (x < xMax)
    position.e = () => getSurrounding(layout, x+1, y);

  if (x < xMax && y > 0)
    position.ne = () => getSurrounding(layout, x+1, y-1);
  
  if (x > 0 && y > 0)
    position.nw = () => getSurrounding(layout, x-1, y-1);

  if (x <= xMax && y < yMax)
    position.se = () => getSurrounding(layout, x+1, y+1);
  
  if (x > 0 && y < yMax)
    position.sw = () => getSurrounding(layout, x-1, y+1);

  return position;
}

const generateLayout = async (size) => {
  const layout = []
  //  Build the rows
  for(let y = 0; y < size; y = y + 1) {
    layout[y] = [];
    // Build the columns
    for(let x = 0; x < size; x = x + 1) {
      layout [y][x] = {};
      let wall = false;
      let destructable = false;
      // Add the walls
      if ((y == 0 || y == (size - 1)) 
        || (x == 0 || x == (size - 1))) {
        wall = true;
      } else {
        // Generate random wall
        let random = 0.2;
        const position = getSurrounding(layout, x, y);
        if(position.n().wall || position.w().wall) {
          random = 0.5

          // 0 wall if will make a square
          if (position.n().wall && position.w().wall && position.nw().wall) {
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
      layout[y][x] = {
        wall,
        destructable,
        x,
        y
      }
    }
  }
  return layout
}

const fillSingleBlank = (layout) => {
  return layout.map((row, y) => {
    return row.map((column, x) => {
      // const max = row.length - 1;
      // // shortcut processing on the edge
      // if (y == 0 || y == max || x == 0 || x == max) {
      //   return column;
      // }
      
      const surrounding = getSurrounding(layout, x, y);
      if (!column.wall
        && surrounding.n().wall 
        && surrounding.e().wall
        && surrounding.s().wall
        && surrounding.w().wall) {
          column.wall = true;
        }
      return column;
    });
  });
}

/**
 * Returns an integer representing a number from 1 to max
 * @param {int} max Max number of options to return
 * @returns {int} The number chosen
 */
const getRandomInt = (max) => {
  return Math.ceil(Math.random() * max);
}

const deblock = async (layout) => {
  console.log('Running deblock');

  layout.forEach((row, y) => {
    row.forEach((cell, x) => {
      const max = row.length - 1;
      // shortcut processing on the edge
      if (y == 0 || y == max || x == 0 || x == max) {
        return;
      }

      let test = getSurrounding(layout, x, y);
      let testAcross = getSurrounding(layout, x, y);
      let testDown = getSurrounding(layout, x, y);
      // console.log(test);
      let maxAcross = 999;
      let goingDown = 0;

      try {

        while (testDown != null && testDown.y < max && testDown.wall) {
          let xAcross = 0;
          while (testAcross != null && testAcross.x < max && testAcross.wall) {
            xAcross += 1;
            testAcross = getSurrounding(layout, testDown.x + xAcross, testDown.y);
          }
          maxAcross = xAcross < maxAcross ? xAcross : maxAcross;
          goingDown++;
          testDown = getSurrounding(layout, x, y + goingDown);
          testAcross = getSurrounding(layout, x, y + goingDown);
        }

        if (maxAcross > 1 && goingDown > 1) {
          console.log('Found block:', x, y, maxAcross, goingDown);
          // chose whether to keep an x or y
          let choice = getRandomInt(2);
          if (choice == 1) {
            // keep a single column
            choice = getRandomInt(maxAcross);

          } else {
            // keep a single row
            choice = getRandomInt(goingDown);
          }
        }
      } catch (e) {
        console.log(x, y, e);
      }
    });
  });

  //return fillSingleBlank(layout);
  return layout;
}

module.exports = (app, pathName, opts) => async (
  data,
  h
) => {
    // Size of the game area
    const size = 10;
    // Creates the initial layout
    let layout = await generateLayout(size);
    // Fill in tiny spaces
    layout = await fillSingleBlank(layout);
    layout = await deblock(layout);

    return h.response({
      layout,
      'monsters': [],
      'exit': {
        x: 2,
        y: 2,
      }
    });
  }
