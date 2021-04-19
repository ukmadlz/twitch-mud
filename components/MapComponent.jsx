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
      const { data } = message;
      if (data) {
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
      }
    });
  }

  render() {
    const {
      layout,
      exit,
      monsters,
      mapType,
      players,
    } = this.state;
    const max = layout.length;
    const completeMap = layout.map((row, y) => {
      const completeRow = row.map((column, x) => {
        let content;
        if (y === 0) content = x;
        if (x === 0) content = y;
        let border = '';
        let blockColour = ((column.wall) ? 'black' : 'white');
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
        if (exit.x === x && exit.y === y) {
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
          .filter((playerName) => (players[playerName].playerPosition.x === x
            && players[playerName].playerPosition.y === y));
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
};

export default MapComponent;
