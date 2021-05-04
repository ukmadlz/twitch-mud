/* eslint-disable react/prefer-stateless-function */
import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowCircleUp,
  faArrowCircleDown,
  faArrowCircleLeft,
  faArrowCircleRight,
  faRunning,
  faCrosshairs,
} from '@fortawesome/free-solid-svg-icons';
import Axios from '../helpers/axios';

class ControllerComponent extends React.Component {
  static dPad(user, action, logo) {
    return (
      <table>
        <tbody>
          <tr>
            <td />
            <td>
              <FontAwesomeIcon
                icon={faArrowCircleUp}
                size="2x"
                onClick={ControllerComponent.doThing(user, action, 'up')}
              />
            </td>
            <td />
          </tr>
          <tr>
            <td>
              <FontAwesomeIcon
                icon={faArrowCircleLeft}
                size="2x"
                onClick={ControllerComponent.doThing(user, action, 'left')}
              />
            </td>
            <td>
              <FontAwesomeIcon
                icon={logo}
                size="2x"
              />
            </td>
            <td>
              <FontAwesomeIcon
                icon={faArrowCircleRight}
                size="2x"
                onClick={ControllerComponent.doThing(user, action, 'right')}
              />
            </td>
          </tr>
          <tr>
            <td />
            <td>
              <FontAwesomeIcon
                icon={faArrowCircleDown}
                size="2x"
                onClick={ControllerComponent.doThing(user, action, 'down')}
              />
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    );
  }

  static doThing(user, action, direction) {
    const url = `/${user}/${action}/${direction}`;
    return async () => {
      const { data } = await Axios.get(url);
      console.log(data);
    };
  }

  render() {
    const { user } = this.props;
    return (
      <div>
        {ControllerComponent.dPad(user, 'move', faRunning)}
        {ControllerComponent.dPad(user, 'attack', faCrosshairs)}
      </div>
    );
  }
}

ControllerComponent.propTypes = {
  user: PropTypes.string.isRequired,
};

export default ControllerComponent;
