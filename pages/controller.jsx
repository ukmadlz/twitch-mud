import HeadComponent from '../components/HeadComponent';
import MapComponent from '../components/MapComponent';
import ControllerComponent from '../components/ControllerComponent';

// @TODO REMOVE ASAP
const user = 'ukmadlz';

/**
 * This is the players controller
 *
 * @returns A full copy the current game
 */
export default function Controller() {
  return (
    <div>
      <HeadComponent />
      <MapComponent user={user} />
      <ControllerComponent user={user} />
    </div>
  );
}
