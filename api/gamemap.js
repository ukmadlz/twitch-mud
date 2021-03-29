const Debug = require('../helpers/debug');

const getSurrounding = (layout, x, y) => {
  Debug.log(x, y, layout[y][x]);
  let current;
  try {
    current = layout[y][x];
    if (current == null) return null;
  } catch (e) {
    return null;
  }
  const position = {
    x: current.x,
    y: current.y,
    wall: current.wall,
    destructable: current.destructable,
    n: () => getSurrounding(layout, x, y - 1),
    s: () => getSurrounding(layout, x, y + 1),
    e: () => getSurrounding(layout, x + 1, y),
    w: () => getSurrounding(layout, x - 1, y),
    ne: () => getSurrounding(layout, x + 1, y - 1),
    nw: () => getSurrounding(layout, x - 1, y - 1),
    se: () => getSurrounding(layout, x + 1, y + 1),
    sw: () => getSurrounding(layout, x - 1, y + 1),
  };

  return position;
};

const generateLayout = async (size, mapFactor) => {
  const generalWallRandom = 0.6 - (mapFactor / 2);
  const alignedWallFactor = mapFactor;

  const layout = [];
  //  Build the rows
  for (let y = 0; y < size; y += 1) {
    layout[y] = [];
    // Build the columns
    for (let x = 0; x < size; x += 1) {
      layout[y][x] = {};
      let wall = false;
      let destructable = false;
      // Add the walls
      if ((y === 0 || y === (size - 1))
        || (x === 0 || x === (size - 1))) {
        wall = true;
      } else {
        // Generate random wall
        let random = generalWallRandom;
        const position = getSurrounding(layout, x, y);
        if (position.n().wall || position.w().wall) {
          random = alignedWallFactor;

          // 0 wall if will make a square
          if (position.n().wall && position.w().wall && position.nw().wall) {
            random = 0;
          }
        }
        if (Math.random() < random) {
          wall = true;
          // Can you blow the wall up!
          if (Math.random() < generalWallRandom) {
            destructable = true;
          }
        }
      }
      layout[y][x] = {
        wall,
        destructable,
        x,
        y,
      };
    }
  }
  return layout;
};

const fillSingleBlanks = (layout) => {
  Debug.info('Running fill single blanks');
  return layout.map((row, y) => row.map((column, x) => {
    const newColumn = column;
    const max = row.length - 1;
    // shortcut processing on the edge
    if (y === 0 || y === max || x === 0 || x === max) {
      return newColumn;
    }

    const surrounding = getSurrounding(layout, x, y);
    if (!newColumn.wall
        && surrounding.n()?.wall
        && surrounding.e()?.wall
        && surrounding.s()?.wall
        && surrounding.w()?.wall) {
      Debug.info('Filling blank at', x, y);
      Debug.info(newColumn);
      newColumn.wall = true;
      Debug.info(newColumn);
    }
    return newColumn;
  }));
};

/**
 * Returns an integer representing a number from 1 to max.
 *
 * @param {int} max Max number of options to return.
 * @returns {int} The number chosen.
 */
const getRandomInt = (max) => Math.ceil(Math.random() * max);

/**
 * Searches the map for big blocks of walls. Will randomly keep a row or column of this block.
 *
 * @param layout Current map layout.
 * @returns Updated layout.
 */
const deblock = async (layout) => {
  const newLayout = layout;
  Debug.info('Running deblock');

  newLayout.forEach((row, y) => {
    row.forEach((cell, x) => {
      const max = row.length - 1;
      // shortcut processing on the edge
      if (y === 0 || y === max || x === 0 || x === max) {
        return;
      }

      let testAcross = getSurrounding(newLayout, x, y);
      let testDown = getSurrounding(newLayout, x, y);

      let maxAcross = 999;
      let goingDown = 0;

      try {
        while (testDown != null && testDown.y < max && testDown.wall && testDown.e().wall) {
          let xAcross = 0;
          while (testAcross != null && testAcross.x < max && testAcross.wall) {
            xAcross += 1;
            testAcross = getSurrounding(newLayout, testDown.x + xAcross, testDown.y);
          }
          maxAcross = (xAcross > 1 && xAcross < maxAcross) ? xAcross : maxAcross;
          goingDown += 1;
          testDown = getSurrounding(newLayout, x, y + goingDown);
          testAcross = getSurrounding(newLayout, x, y + goingDown);
        }

        if (maxAcross < 999 && maxAcross > 1 && goingDown > 1) {
          Debug.info('Found block:', x, y, maxAcross, goingDown);
          // choose whether to keep an x or y
          let choice = getRandomInt(2);
          if (choice === 1) {
            // keep a single column
            choice = getRandomInt(maxAcross);
            Debug.info('For block', maxAcross, goingDown, 'at', x, y, 'keeping column', choice);
            for (let nukerX = 0; nukerX < maxAcross; nukerX += 1) {
              for (let nukerY = 0; nukerY < goingDown; nukerY += 1) {
                if (nukerX + 1 !== choice) {
                  newLayout[y + nukerY][x + nukerX].wall = false;
                  newLayout[y + nukerY][x + nukerX].destructable = false;
                  newLayout[y + nukerY][x + nukerX].nuke = true;
                }
              }
            }
          } else {
            // keep a single row
            choice = getRandomInt(goingDown);
            Debug.info('For block', maxAcross, goingDown, 'at', x, y, 'keeping row', choice);
            for (let nukerX = 0; nukerX < maxAcross; nukerX += 1) {
              for (let nukerY = 0; nukerY < goingDown; nukerY += 1) {
                if (nukerY + 1 !== choice) {
                  newLayout[y + nukerY][x + nukerX].wall = false;
                  newLayout[y + nukerY][x + nukerX].destructable = false;
                  newLayout[y + nukerY][x + nukerX].nuke = true;
                }
              }
            }
          }
        }
      } catch (e) {
        Debug.error(x, y, e);
      }
    });
  });

  return fillSingleBlanks(newLayout);
};

const selectExit = (layout) => {
  const generateXY = () => {
    const innerMapSize = layout.length - 2;
    const x = getRandomInt(innerMapSize);
    const y = getRandomInt(innerMapSize);
    return {
      x,
      y,
    };
  };
  const checkAccess = (exit) => {
    const surrounding = getSurrounding(layout, exit.x, exit.y);
    return !((surrounding.n && surrounding.n().wall)
      && (surrounding.e && surrounding.e().wall)
      && (surrounding.s && surrounding.s().wall)
      && (surrounding.w && surrounding.w().wall));
  };
  const cycleExit = (exit) => {
    if (!checkAccess(exit)) {
      return cycleExit(generateXY());
    }
    return exit;
  };
  let exit = generateXY();
  exit = cycleExit(exit);
  return exit;
};

module.exports = (app, pathName, opts) => async (
  data,
  h,
) => {
  let mapType = 'Village';
  let mapFactor = 0;
  const mapTypeChoice = getRandomInt(3);
  switch (mapTypeChoice) {
    case 1:
      mapType = 'Forest';
      mapFactor = 0.1;
      break;

    case 2:
      maptype = 'Village';
      mapFactor = 0.3;
      break;

    case 3:
    default:
      mapType = 'Castle';
      mapFactor = 0.8;
  }
  // Size of the game area
  const gameSize = 20;
  // Creates the initial layout
  let layout = await generateLayout(gameSize, mapFactor);
  try {
    // Fill in tiny spaces
    layout = await fillSingleBlanks(layout);
    // remove big blocks of wall
    layout = await deblock(layout);
  } catch (e) {
    Debug.error(e);
  }

  // Add an exit
  const exit = selectExit(layout);
  return h.response({
    mapType,
    layout,
    monsters: [],
    exit,
  });
};
