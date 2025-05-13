import io from 'socket.io-client';

/**
 * Socket service for real-time game updates
 */
class SocketService {
  socket = null;
  listeners = {};
  
  /**
   * Initialize the socket connection
   * @returns {SocketService} - this instance for chaining
   */
  connect() {
    if (this.socket) return this;
    
    // Initialize socket connection
    this.socket = io(window.location.origin);
    
    // Setup connection event handlers
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    return this;
  }
  
  /**
   * Disconnect the socket
   */
  disconnect() {
    if (!this.socket) return;
    
    this.socket.disconnect();
    this.socket = null;
  }
  
  /**
   * Join a specific room
   * @param {string} roomCode - The room to join
   */
  joinRoom(roomCode) {
    if (!this.socket) this.connect();
    this.socket.emit('join_room', roomCode);
  }
  
  /**
   * Register event listeners for game events
   * @param {string} event - The event name to listen for
   * @param {function} callback - The callback function when event is received
   */
  on(event, callback) {
    if (!this.socket) this.connect();
    
    // Store listener reference for cleanup
    this.listeners[event] = callback;
    this.socket.on(event, callback);
    
    return this;
  }
  
  /**
   * Remove an event listener
   * @param {string} event - The event name to remove listener for
   */
  off(event) {
    if (!this.socket) return;
    
    if (this.listeners[event]) {
      this.socket.off(event, this.listeners[event]);
      delete this.listeners[event];
    }
    
    return this;
  }
  
  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    if (!this.socket) return;
    
    Object.keys(this.listeners).forEach(event => {
      this.socket.off(event, this.listeners[event]);
    });
    
    this.listeners = {};
    
    return this;
  }
}

// Export a singleton instance
const socketService = new SocketService();
export default socketService;