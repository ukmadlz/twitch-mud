import HeadComponent from '../components/HeadComponent';
import MapComponent from '../components/MapComponent';

// @TODO REMOVE ASAP
const user = 'ukmadlz';

/**
 * The Game is a foot
 *
 * @returns A full copy the current game
 */
export default function Game() {
  return (
    <div>
      <HeadComponent />
      <MapComponent user={user} />
    </div>
  );
}
