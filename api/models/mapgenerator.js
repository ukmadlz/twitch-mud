const Debug = require('../../helpers/debug');

module.exports = class MapGenerator {
  getSurrounding(layout, x, y) {
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
      n: () => this.getSurrounding(layout, x, y - 1),
      s: () => this.getSurrounding(layout, x, y + 1),
      e: () => this.getSurrounding(layout, x + 1, y),
      w: () => this.getSurrounding(layout, x - 1, y),
      ne: () => this.getSurrounding(layout, x + 1, y - 1),
      nw: () => this.getSurrounding(layout, x - 1, y - 1),
      se: () => this.getSurrounding(layout, x + 1, y + 1),
      sw: () => this.getSurrounding(layout, x - 1, y + 1),
    };

    return position;
  }

  generateLayout(size, mapFactor) {
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
          const position = this.getSurrounding(layout, x, y);
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
  }

  fillSingleBlanks(layout) {
    Debug.info('Running fill single blanks');
    return layout.map((row, y) => row.map((column, x) => {
      const newColumn = column;
      const max = row.length - 1;
      // shortcut processing on the edge
      if (y === 0 || y === max || x === 0 || x === max) {
        return newColumn;
      }

      const surrounding = this.getSurrounding(layout, x, y);
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
  }

  /**
   * Returns an integer representing a number from 1 to max.
   *
   * @param {int} max Max number of options to return.
   * @returns {int} The number chosen.
   */
  getRandomInt(max) { return Math.ceil(Math.random() * max); }

  /**
   * Searches the map for big blocks of walls. Will randomly keep a row or column of this block.
   *
   * @param layout Current map layout.
   * @returns Updated layout.
   */
  deblock(layout) {
    const newLayout = layout;
    Debug.info('Running deblock');

    newLayout.forEach((row, y) => {
      row.forEach((cell, x) => {
        const max = row.length - 1;
        // shortcut processing on the edge
        if (y === 0 || y === max || x === 0 || x === max) {
          return;
        }

        let testAcross = this.getSurrounding(newLayout, x, y);
        let testDown = this.getSurrounding(newLayout, x, y);

        let maxAcross = 999;
        let goingDown = 0;

        try {
          while (testDown != null && testDown.y < max && testDown.wall && testDown.e().wall) {
            let xAcross = 0;
            while (testAcross != null && testAcross.x < max && testAcross.wall) {
              xAcross += 1;
              testAcross = this.getSurrounding(newLayout, testDown.x + xAcross, testDown.y);
            }
            maxAcross = (xAcross > 1 && xAcross < maxAcross) ? xAcross : maxAcross;
            goingDown += 1;
            testDown = this.getSurrounding(newLayout, x, y + goingDown);
            testAcross = this.getSurrounding(newLayout, x, y + goingDown);
          }

          if (maxAcross < 999 && maxAcross > 1 && goingDown > 1) {
            Debug.info('Found block:', x, y, maxAcross, goingDown);
            // choose whether to keep an x or y
            let choice = this.getRandomInt(2);
            if (choice === 1) {
              // keep a single column
              choice = this.getRandomInt(maxAcross);
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
              choice = this.getRandomInt(goingDown);
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

    return this.fillSingleBlanks(newLayout);
  }

  selectExit(layout) {
    const generateXY = () => {
      const innerMapSize = layout.length - 2;
      const x = this.getRandomInt(innerMapSize);
      const y = this.getRandomInt(innerMapSize);
      return {
        x,
        y,
      };
    };
    const checkAccess = (exit) => {
      const surrounding = this.getSurrounding(layout, exit.x, exit.y);
      Debug.info(surrounding);
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
  }

  selectSafeStart(layout, exit) {
    const generateXY = () => {
      const innerMapSize = layout.length - 2;
      const x = this.getRandomInt(innerMapSize);
      const y = this.getRandomInt(innerMapSize);
      return {
        x,
        y,
      };
    };
    const checkAccess = (playerPosition) => {
      const surrounding = this.getSurrounding(layout, playerPosition.x, playerPosition.y);
      Debug.info('Check if in a wall');
      Debug.info({ surrounding });
      if (surrounding.wall) return false;
      Debug.info('Check if exit');
      Debug.info(exit);
      if (exit.x === playerPosition.x && playerPosition.y) return false;
      Debug.info('Check if too close to the exit');
      const innerMapSize = layout.length - 2;
      const maxRange = Math.floor(innerMapSize / 4);
      Debug.info(playerPosition.x, (exit.x - maxRange), (exit.x + maxRange));
      Debug.info(playerPosition.y, (exit.y - maxRange), (exit.y + maxRange));
      const between = (x, min, max) => x >= min && x <= max;
      if (between(playerPosition.x, (exit.x - maxRange), (exit.x + maxRange))
       && between(playerPosition.y, (exit.y - maxRange), (exit.y + maxRange))) return false;
      return true;
    };
    const cyclePlayerPosition = (playerPosition) => {
      if (!checkAccess(playerPosition)) {
        return cyclePlayerPosition(generateXY());
      }
      return playerPosition;
    };
    let playerPosition = generateXY();
    playerPosition = cyclePlayerPosition(playerPosition);
    return playerPosition;
  }
};
