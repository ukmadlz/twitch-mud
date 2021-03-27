import Axios from '../helpers/axios'

export async function getStaticProps() {
  const { data } = await Axios.get('http://localhost:3000/map');
  return {
    props: {
      ...data
    },
  };
}

export default function Game({ mapType, layout, exit, monsters }) {
  const max = layout.length;
  const completeMap = layout.map((row, y) => {
    const completeRow = row.map((column, x) => {
      let content;
      if (y == 0) content = x;
      if (x == 0) content = y;
      let border = '';
      let blockColour = ((column.wall) ? 'black' : 'white');

      if (x != 0 && x != max - 1 && y != 0 && y != max - 1) {
        // set block colours
        if (column.wall && mapType == 'Forest') {
          const g = 100 + Math.random() * 155;
          const r = Math.random() * g;
          blockColour = `rgb(${r}, ${g}, 0)`;
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
          //blockColour = '#edd';
        }
      }
      if (exit.x === x && exit.y === y) {
        blockColour = 'blue';
      }
      return <td
        key={'position'+x+y}
        style={{
          width: "2em",
          height: "2em",
          background: blockColour,
          border,
          color: "white",
        }}
      ><center>{content}</center>
      </td>
    });
    return <tr key={'row'+y}>{completeRow}</tr>
  });
  return <div>
    <h1>{mapType}</h1>
    <table>
      <tbody>
      {completeMap}
      </tbody>
    </table>
  </div>
}