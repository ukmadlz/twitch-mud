import { useRouter } from 'next/router';
import HeadComponent from '../../components/HeadComponent';
import MapComponent from '../../components/MapComponent';
import ControllerComponent from '../../components/ControllerComponent';

/**
 * This is the players controller
 *
 * @returns A full copy the current game
 */
export default function Controller({ player }) {
  const router = useRouter();
  const { user } = router.query;
  return (
    <div>
      <HeadComponent />
      <MapComponent user={user} player={player} fov={3} />
      <ControllerComponent user={user} />
    </div>
  );
}
/**
 *
 */
export async function getServerSideProps(ctx) {
  // eslint-disable-next-line camelcase
  const { twitch_name } = ctx.req.auth.credentials;
  return {
    props: {
      player: twitch_name,
    },
  };
}
