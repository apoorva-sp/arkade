import React, { useState } from 'react';
import Login from './Login';
import Home from './Home';


function App() {
  const [username, setUsername] = useState('');
  const [currentGame, setCurrentGame] = useState(null);

  const handleLogin = (name) => {
    console.log(username)
    setUsername(name);
    console.log(currentGame)
    
  };

  const handleSelectGame = (gameId) => {
    setCurrentGame(gameId);
    console.log(currentGame)
    console.log(`Starting game: ${gameId}`);
  };

  if (!username) {
    return <Login onLogin={handleLogin} />;
  }

  if (!currentGame) {
    return <Home username={username} onSelectGame={handleSelectGame} />;
  }

  return (
    <>
    <div className="game-container">
      <div className="game-header">
        <h1>{currentGame}</h1>
        <button onClick={() => setCurrentGame(null)} >Back to Games</button>
      </div>
      <div className="game-content">
        <p>Game content for {currentGame} will go here</p>
      </div>
    </div>
    </>
  );
  
}

export default App;