import { useRouter } from 'next/router';
import HeadComponent from '../../components/HeadComponent';
import MapComponent from '../../components/MapComponent';
import ControllerComponent from '../../components/ControllerComponent';

/**
 * This is the players controller
 *
 * @returns A full copy the current game
 */
export default function Controller() {
  const router = useRouter();
  const { user } = router.query;
  return (
    <div>
      <HeadComponent />
      <MapComponent user={user} player={user} fov={3} />
      <ControllerComponent user={user} />
    </div>
  );
}
export async function getServerSideProps() {
  return {
    props: {
    },
  };
}
