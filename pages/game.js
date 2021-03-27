import Axios from '../helpers/axios'

export async function getStaticProps() {
  const { data } = await Axios.get('http://localhost:3000/map');
  return {
    props: {
      ...data
    },
  };
}

export default function Game({ layout, exit, monsters }) {
  const completeMap = layout.map((row, y) => {
    const completeRow = row.map((column, x) => {
      let blockColour = ((column.wall) ? 'black' : 'white' );
      if (column.destructable) {
        blockColour = 'gray';
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
        }}
      >
      </td>
    });
    return <tr key={'row'+y}>{completeRow}</tr>
  });
  return <table>
    <tbody>
     {completeMap}
    </tbody>
  </table>
}