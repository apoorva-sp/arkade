import axios from 'axios';

// Base API configuration with proxy handling
const API = axios.create({
    baseURL:'/connectFour.php',
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Connect Four API Service
 * Handles all API calls to the backend for the Connect Four game
 */
const connectFourService = {
  /**
   * Host a new game
   * @param {string} username - The host's username
   * @returns {Promise} - The API response
   */
  hostGame: async (username) => {
    try {
      const response = await API.post('', {
        serviceID: 1,
        username
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * Join an existing game
   * @param {string} roomCode - The game's room code
   * @param {string} username - The player's username
   * @returns {Promise} - The API response
   */
  joinGame: async (roomCode, username) => {
    try {
      const response = await API.post('', {
        serviceID: 2,
        room_code: roomCode,
        username
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * Make a move in the game
   * @param {string} roomCode - The game's room code
   * @param {number} column - The column index where the disc will be dropped
   * @param {string} username - The player's username
   * @returns {Promise} - The API response
   */
  playGame: async (roomCode, column, username) => {
    try {
      const response = await API.post('', {
        serviceID: 3,
        room_code: roomCode,
        column,
        username
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * Leave/destroy a game
   * @param {string} roomCode - The game's room code
   * @param {string} username - The player's username
   * @returns {Promise} - The API response
   */
  leaveGame: async (roomCode, username) => {
    try {
      const response = await API.post('', {
        serviceID: 4,
        room_code: roomCode,
        username
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },

  /**
   * Start a new round in the same room
   * @param {string} roomCode - The game's room code
   * @returns {Promise} - The API response
   */
  playAgain: async (roomCode) => {
    try {
      const response = await API.post('', {
        serviceID: 5,
        room_code: roomCode
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }
};

/**
 * Handle API errors consistently
 * @param {Error} error - The error object from Axios
 */
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Server error:', error.response.data);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Network error - no response received');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Request error:', error.message);
  }
};

export default connectFourService;