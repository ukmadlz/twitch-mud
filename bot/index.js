const ComfyJS = require('comfy.js');
const Dotenv = require('dotenv');
const Fetch = require('node-fetch');

// All the MUD bits
const JoinMap = require('../api/joinmap');

Dotenv.config();

// Channel Owner Details
const CHANNEL_OWNER_ID = process.env.CHANNEL_OWNER_ID || '';
const CHANNEL_OWNER_NAME = process.env.TWITCH_CHANNEL;

/**
 * Checks that the user making the command is a follower
 *
 * @param {string} channelUserId Channel Owners User ID
 * @param {string} commandUserId Command User ID
 * @returns {Promise<boolean>}
 */
const isFollower = async (channelUserId, commandUserId) => {
  const followerUrl = `https://ukmadlz-tau.onrender.com/api/twitch/helix/users/follows?format=json&from_id=${channelUserId}&to_id=${commandUserId}`;
  const response = await Fetch(followerUrl,
    {
      method: 'get',
      headers: {
        Authorization: `Token ${process.env.TAU_WS_TOKEN}`,
      },
    });
  const followerUserData = await response.json();
  return followerUserData.total;
};

/**
 * Checks if the user can run said command
 *
 * @param {string} permissions Permissions object for the command
 * @param {string} flags Flags sent from Twitch
 * @param {Function} follower Check if the user is a follower of the channel
 * @returns {boolean}
 */
const isAllowed = async (permissions, flags, follower) => {
  if (permissions.anyone) {
    return true;
  }
  if (permissions.broadcaster && flags.broadcaster) {
    return true;
  }
  if (permissions.customReward && flags.customReward) {
    return true;
  }
  if (permissions.founder && flags.founder) {
    return true;
  }
  if (permissions.highlighted && flags.highlighted) {
    return true;
  }
  if (permissions.mod && flags.mod) {
    return true;
  }
  if (permissions.subscriber && flags.subscriber) {
    return true;
  }
  if (permissions.vip && flags.vip) {
    return true;
  }
  if (permissions.follower && await follower) {
    return true;
  }
  return false;
};

// List of commands
const PossibleCommands = {
  mudjoin: {
    permissions: {
      follower: true,
    },
    action: (user, message, flags, extra) => {
      console.log('Join the game');
      const { userId } = extra;
      JoinMap.joinGame(CHANNEL_OWNER_NAME, userId);
    },
  },
};

// Receive the command from Twitch and do something
ComfyJS.onCommand = async (user, command, message, flags, extra) => {
  if (PossibleCommands[command]) {
    const { userId } = extra;
    const {
      permissions,
      action,
    } = PossibleCommands[command];
    if (await isAllowed(permissions, flags, isFollower(CHANNEL_OWNER_ID, userId))) {
      action(user, message, flags, extra);
    }
  }
};

module.exports = () => {
  ComfyJS.Init(CHANNEL_OWNER_NAME);
};
