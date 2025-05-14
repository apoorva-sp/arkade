import React, { useState, useEffect, useCallback } from 'react';
import connectFourService from './utilities/connectFourService';
import socketService from './utilities/socketService';

// Main Connect Four App Component
function ConnectFourApp() {
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [gameState, setGameState] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [message, setMessage] = useState('');
  const [gamePhase, setGamePhase] = useState('login'); // login, waiting, playing, gameover
  const [isLoading, setIsLoading] = useState(false);

  // Define updateGameState before using it in the useEffect
  const updateGameState = useCallback((data) => {
    setGameState(data);
    setCurrentPlayer(data.currentPlayer);
    
    if (data.winner) {
      setGamePhase('gameover');
      setMessage(data.winner === username ? 'You won!' : `${data.winner} won!`);
    } else if (data.draw) {
      setGamePhase('gameover');
      setMessage("It's a draw!");
    } else {
      setGamePhase('playing');
    }
  }, [username]);

  // Connect to socket on component mount
  useEffect(() => {
    // Initialize socket connection
    socketService.connect()
      .on('game_played', (data) => {
        updateGameState(data);
      })
      .on('player_left', (data) => {
        setMessage(`${data.username} has left the game`);
        // Redirect to home after 3 seconds
        setTimeout(() => {
          setGamePhase('login');
          setGameState(null);
        }, 3000);
      });

    // Cleanup function to disconnect socket when component unmounts
    return () => {
      socketService.removeAllListeners().disconnect();
    };
  }, [updateGameState]);

  // Join a specific socket.io room when room code is available
  useEffect(() => {
    if (roomCode) {
      socketService.joinRoom(roomCode);
    }
  }, [roomCode]);

  const showError = (error) => {
    console.error(error);
    setMessage('Error connecting to server. Please try again.');
    setIsLoading(false);
  };

  const handleHostGame = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setMessage('Please enter a username');
      return;
    }

    setIsLoading(true);
    try {
      const data = await connectFourService.hostGame(username);
      
      if (data.status.code === 0) {
        setRoomCode(data.room_code);
        setGameState(data);
        setCurrentPlayer(data.currentPlayer);
        setGamePhase('waiting');
        setMessage(`Game created! Share code: ${data.room_code}`);
      } else {
        setMessage(data.status.message);
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinGame = async (e) => {
    e.preventDefault();
    if (!username.trim() || !roomCode.trim()) {
      setMessage('Please enter username and room code');
      return;
    }

    setIsLoading(true);
    try {
      const data = await connectFourService.joinGame(roomCode, username);
      
      if (data.status.code === 0) {
        setGameState(data);
        setCurrentPlayer(data.currentPlayer);
        setGamePhase('playing');
      } else {
        setMessage(data.status.message);
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleColumnClick = async (columnIndex) => {
    // Check if it's player's turn and column is not full
    if (gamePhase !== 'playing' || currentPlayer !== username || 
        (gameState.board && gameState.board[0][columnIndex] !== 0)) {
      return;
    }

    setIsLoading(true);
    try {
      await connectFourService.playGame(roomCode, columnIndex, username);
      // No need to update state here, the socket will broadcast to all players
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayAgain = async () => {
    setIsLoading(true);
    try {
      const data = await connectFourService.playAgain(roomCode);
      
      if (data.status.code === 0) {
        updateGameState(data);
      } else {
        setMessage(data.status.message);
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveGame = async () => {
    setIsLoading(true);
    try {
      const data = await connectFourService.leaveGame(roomCode, username);
      
      if (data.status.code === 0) {
        setGamePhase('login');
        setGameState(null);
        setRoomCode('');
      } else {
        setMessage(data.status.message);
      }
    } catch (error) {
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render Login/Join screen
  if (gamePhase === 'login') {
    return (
      <div className="connect-four-container">
        <h1>Connect Four</h1>
        <div className="forms-container">
          <div className="form-section">
            <h2>Host a Game</h2>
            <form onSubmit={handleHostGame}>
              <input
                type="text"
                placeholder="Your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Game'}
              </button>
            </form>
          </div>
          
          <div className="form-section">
            <h2>Join a Game</h2>
            <form onSubmit={handleJoinGame}>
              <input
                type="text"
                placeholder="Your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
              <input
                type="text"
                placeholder="Room Code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                required
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Joining...' : 'Join Game'}
              </button>
            </form>
          </div>
        </div>
        {message && <div className="message">{message}</div>}
      </div>
    );
  } 
  // Render Waiting for opponent screen
  else if (gamePhase === 'waiting') {
    return (
      <div className="connect-four-container">
        <h1>Connect Four</h1>
        <div className="waiting-room">
          <h2>Waiting for Opponent</h2>
          <p>Share this room code with your friend: <strong>{roomCode}</strong></p>
          <button onClick={handleLeaveGame} disabled={isLoading}>
            {isLoading ? 'Leaving...' : 'Leave Game'}
          </button>
        </div>
        {message && <div className="message">{message}</div>}
      </div>
    );
  } 
  // Render Game board screen (playing or game over)
  else {
    return (
      <div className="connect-four-container">
        <h1>Connect Four</h1>
        <div className="game-info">
          <p>Room: {roomCode}</p>
          <p>Player: {username}</p>
          <p>Current Turn: {currentPlayer}</p>
        </div>
        
        {message && <div className="message">{message}</div>}
        
        {isLoading && <div className="loading-indicator">Processing move...</div>}
        
        <div className="game-board">
          {gameState && gameState.board && gameState.board.map((row, rowIndex) => (
            <div key={rowIndex} className="board-row">
              {row.map((cell, colIndex) => (
                <div 
                  key={colIndex} 
                  className="board-cell"
                  onClick={() => handleColumnClick(colIndex)}
                >
                  {cell !== 0 && (
                    <div 
                      className={`disc ${cell === 1 ? 'red' : 'yellow'}`} 
                      title={gameState.players && gameState.players[cell === 1 ? 0 : 1]}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
          
          {/* Column hover indicators - only active when it's player's turn */}
          <div className="column-indicators">
            {gameState && gameState.board && gameState.board[0].map((_, colIndex) => (
              <div 
                key={colIndex} 
                className={`column-indicator ${currentPlayer === username && gamePhase === 'playing' ? 'active' : ''}`}
                onClick={() => handleColumnClick(colIndex)}
              />
            ))}
          </div>
        </div>
        
        <div className="game-controls">
          {gamePhase === 'gameover' && (
            <button onClick={handlePlayAgain} disabled={isLoading}>
              {isLoading ? 'Starting...' : 'Play Again'}
            </button>
          )}
          <button onClick={handleLeaveGame} disabled={isLoading}>
            {isLoading ? 'Leaving...' : 'Leave Game'}
          </button>
        </div>
      </div>
    );
  }
}

export default ConnectFourApp;