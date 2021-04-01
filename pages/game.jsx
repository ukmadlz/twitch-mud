import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen, faTree } from '@fortawesome/free-solid-svg-icons';
import Axios from '../helpers/axios';

// @TODO REMOVE ASAP
const user = 'ukmadlz';

/**
 *
 */
export async function getStaticProps() {
  const { data } = await Axios.get(`http://localhost:3000/${user}/map`);
  return {
    props: {
      ...data,
    },
  };
}

/**
 * @param root0
 * @param root0.mapType
 * @param root0.layout
 * @param root0.exit
 * @param root0.monsters
 */
export default function Game({
  mapType, layout, exit, monsters,
}) {
  const max = layout.length;
  const completeMap = layout.map((row, y) => {
    const completeRow = row.map((column, x) => {
      let content;
      if (y == 0) content = x;
      if (x == 0) content = y;
      let border = '';
      let blockColour = ((column.wall) ? 'black' : 'white');
      let fontColour = 'white';

      if (x != 0 && x != max - 1 && y != 0 && y != max - 1) {
        // set block colours
        if (column.wall && mapType == 'Forest') {
          const g = 100 + Math.random() * 155;
          const r = Math.random() * g;
          blockColour = 'white';
          fontColour = `rgb(${r}, ${g}, 0)`;
          content = (
            <FontAwesomeIcon
              icon={faTree}
              size="2x"
            />
          );
        }

        if (column.wall && mapType == 'Castle') {
          const grayLevel = Math.random() * 30;
          blockColour = `rgb(${grayLevel}, ${grayLevel}, ${grayLevel})`;
        }

        if (column.wall && mapType == 'Village') {
          const grayLevel = 40 + Math.random() * 40;
          blockColour = `rgb(${grayLevel}, ${grayLevel}, ${grayLevel})`;
        }

        if (column.destructable) {
          border = '2px solid gray';
        } else {
          border = '2px solid white';
        }

        if (column.nuke) {
          // blockColour = '#edd';
        }
      }
      // If exit
      if (exit.x === x && exit.y === y) {
        fontColour = 'brown';
        blockColour = 'white';
        content = (
          <FontAwesomeIcon
            icon={faDoorOpen}
            size="2x"
          />
        );
      }
      return (
        <td
          key={`position${x}${y}`}
          style={{
            width: '2em',
            height: '2em',
            background: blockColour,
            border,
            color: fontColour,
          }}
          data-destructable={column.destructable}
        >
          <center>{content}</center>
        </td>
      );
    });
    return <tr key={`row${y}`}>{completeRow}</tr>;
  });
  return (
    <div>
      <h1>{mapType}</h1>
      <table>
        <tbody>
          {completeMap}
        </tbody>
      </table>
    </div>
  );
}
