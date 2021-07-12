/* eslint-disable react/prefer-stateless-function */
import Ably from 'ably/promises';
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDoorOpen, faTree, faUserShield } from '@fortawesome/free-solid-svg-icons';
import Axios from '../helpers/axios';

class MapComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layout: [],
      exit: {},
      monsters: [],
      mapType: '',
      players: {},
    };
    this.channelName = `game-${props.user}`;
    this.ably = new Ably.Realtime.Promise({ authUrl: '/api/ablyTokenRequest' });
    this.channel = this.ably.channels.get(this.channelName);
  }

  async componentDidMount() {
    const { user } = this.props;
    // Load the map
    const { data } = await Axios.get(`/${user}/map`);
    const {
      layout,
      exit,
      monsters,
      mapType,
      players,
    } = data;
    this.setState({
      layout,
      exit,
      monsters,
      mapType,
      players,
    });
    // Listen for player action changes
    this.channel.subscribe((message) => {
      const { data, name } = message;
      if (data) {
        if (name === 'joining' || name === 'moving') {
          const {
            player,
            playerPosition,
            image,
          } = JSON.parse(data);
          const newPlayers = this.state.players;
          newPlayers[player] = { playerPosition, image };
          this.setState({
            players: newPlayers,
          });
        } else if (name === 'attacking') {
          const { block } = JSON.parse(data);
          const newLayout = this.state.layout;
          newLayout[block.y][block.x] = block;
          this.setState({
            layout: newLayout,
          });
        }
      }
    });
  }

  render() {
    const { fov, player } = this.props;
    const {
      exit,
      monsters,
      mapType,
      players,
    } = this.state;
    let {
      layout,
    } = this.state;
    const max = layout.length;
    // If FOV applied, shink the map
    let minY = 0;
    let minX = 0;
    if (fov && player && players[player]) {
      const playerCurrentPosition = players[player].playerPosition;
      minY = playerCurrentPosition.y - fov > 0 ? playerCurrentPosition.y - fov : 0;
      const maxY = playerCurrentPosition.y + fov < max ? playerCurrentPosition.y + fov : max;
      minX = playerCurrentPosition.x - fov > 0 ? playerCurrentPosition.x - fov : 0;
      const maxX = playerCurrentPosition.x + fov < max ? playerCurrentPosition.x + fov : max;
      layout = layout.slice(minY, maxY).map((row) => row.slice(minX, maxX));
    }
    const completeMap = layout.map((row, y) => {
      const completeRow = row.map((column, x) => {
        let content;
        if (y === 0) content = (minX + x);
        if (x === 0) content = (minY + y);
        let border = '';
        let blockColour = ((column.wall || y === 0 || x === 0) ? 'black' : 'white');
        let fontColour = 'white';

        if (x !== 0 && x !== max - 1 && y !== 0 && y !== max - 1) {
          // set block colours
          if (column.wall && mapType === 'Forest') {
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

          if (column.wall && mapType === 'Castle') {
            const grayLevel = Math.random() * 30;
            blockColour = `rgb(${grayLevel}, ${grayLevel}, ${grayLevel})`;
          }

          if (column.wall && mapType === 'Village') {
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
        if ((exit.x === x && exit.y === y)
        || (fov && player && exit.x === (x + fov) && exit.y === (y + fov))) {
          console.log('EXIT TO NO WHERE');
          fontColour = 'brown';
          blockColour = 'white';
          content = (
            <FontAwesomeIcon
              icon={faDoorOpen}
              size="2x"
            />
          );
        }
        // If player!
        const playersOnSpace = Object.keys(players)
          .filter((playerName) => (players[playerName].playerPosition.x === (minX + x)
            && players[playerName].playerPosition.y === (minY + y)));
        if (playersOnSpace.length) {
          const singlePlayerOnSpace = playersOnSpace.pop();
          if (players[singlePlayerOnSpace].image) {
            content = (
              <img
                style={{
                  width: '2em',
                  height: '2em',
                }}
                alt={singlePlayerOnSpace}
                src={players[singlePlayerOnSpace].image}
              />
            );
          } else {
            fontColour = 'blue';
            content = (
              <FontAwesomeIcon
                icon={faUserShield}
                size="2x"
              />
            );
          }
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
}

MapComponent.propTypes = {
  user: PropTypes.string.isRequired,
  fov: PropTypes.number,
  player: PropTypes.string,
};

export default MapComponent;
