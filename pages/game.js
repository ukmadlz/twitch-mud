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
  const completeMap = layout.map((row, y) => {
    const completeRow = row.map((column, x) => {
      let content;
      if (y == 0) content = x;
      if (x == 0) content = y;
      let blockColour = ((column.wall) ? 'black' : 'white' );
      if (column.destructable) {
        blockColour = 'gray';
      }
      if (column.nuke) {
        blockColour = '#edd';
      }
      if (exit.x === x && exit.y === y) {
        blockColour = 'green';
      }
      return <td
        key={'position'+x+y}
        style={{
          width: "2em",
          height: "2em",
          background: blockColour,
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