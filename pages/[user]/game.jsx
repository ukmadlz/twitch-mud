import { useRouter } from 'next/router';
import HeadComponent from '../../components/HeadComponent';
import MapComponent from '../../components/MapComponent';

/**
 * The Game is a foot
 *
 * @returns A full copy the current game
 */
export default function Game() {
  const router = useRouter();
  const { user } = router.query;
  return (
    <div>
      <HeadComponent />
      <MapComponent user={user} />
    </div>
  );
}
export async function getServerSideProps() {
  return {
    props: {
    },
  };
}
