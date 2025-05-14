import { io } from 'socket.io-client';

/**
 * Socket.io Service
 * Handles real-time communication for the Connect Four game
 */
class SocketService {
  constructor() {
    this.socket = null;
  }

  /**
   * Connect to the socket.io server
   * @returns {SocketService} - this instance for chaining
   */
  connect() {
    // Connect to the socket server at the same host as the app
    // If your socket server is running on a different URL, replace this with the specific URL
    this.socket = io('/', {
      transports: ['websocket'],
      path: '/socket.io', // Adjust this if your server uses a different path
    });
    
    console.log('Socket connection initialized');
    return this;
  }

  /**
   * Join a specific room for game updates
   * @param {string} roomCode - The game's room code
   */
  joinRoom(roomCode) {
    if (this.socket) {
      this.socket.emit('join_room', { roomCode });
      console.log(`Joined room: ${roomCode}`);
    } else {
      console.error('Socket connection not established');
    }
  }

  /**
   * Register an event listener
   * @param {string} event - The event name to listen for
   * @param {function} callback - The callback function when event is triggered
   * @returns {SocketService} - this instance for chaining
   */
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      console.log(`Registered listener for event: ${event}`);
    } else {
      console.error('Cannot register event listener: Socket connection not established');
    }
    return this;
  }

  /**
   * Emit an event to the server
   * @param {string} event - The event name
   * @param {object} data - The data to send
   */
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    } else {
      console.error('Cannot emit event: Socket connection not established');
    }
  }

  /**
   * Remove a specific event listener
   * @param {string} event - The event name
   * @returns {SocketService} - this instance for chaining
   */
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
    return this;
  }

  /**
   * Remove all event listeners
   * @returns {SocketService} - this instance for chaining
   */
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
    return this;
  }

  /**
   * Disconnect from the socket server
   * @returns {SocketService} - this instance for chaining
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
    return this;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;