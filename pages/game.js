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
  const completeMap = layout.map((row, x) => {
    const completeRow = row.map((column, y) => {
      return <td
        key={'position'+x+y}
        style={{
          width: "2em",
          height: "2em",
          background: ((column.wall) ? 'black' : 'white' )
        }}
      >
        {(exit.x === x && exit.y === y) ? 'E' : ''}
      </td>
    });
    return <tr key={'row'+x}>{completeRow}</tr>
  });
  return <table>
    <tbody>
     {completeMap}
    </tbody>
  </table>
}