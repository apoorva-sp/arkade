import React, { useState, useEffect } from 'react';
import Login from './Login';
import Home from './Home';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const [username, setUsername] = useState('');
  const [currentGame, setCurrentGame] = useState(null);
  
  // Effect to sync URL with application state
  useEffect(() => {
    const path = window.location.pathname;
    
    // If on game route but no game selected, redirect to home
    if (path === '/game' && !currentGame) {
      window.history.pushState({}, '', '/');
    }
    
    // If on home route but no username, redirect to login
    if (path === '/' && !username) {
      window.history.pushState({}, '', '/login');
    }
  }, [username, currentGame]);

  const handleLogin = (name) => {
    setUsername(name);
    window.history.pushState({}, '', '/'); // Navigate to home after login
  };

  const handleSelectGame = (gameId) => {
    setCurrentGame(gameId);
    window.history.pushState({}, '', '/game'); // Navigate to game after selection
  };

  const handleBackToHome = () => {
    setCurrentGame(null);
    window.history.pushState({}, '', '/'); // Navigate back to home
  };

  // Game content component
  const GameContent = () => (
    <div className="game-container">
      <div className="game-header">
        <h1>{currentGame}</h1>
        <button onClick={handleBackToHome}>Back to Games</button>
      </div>
      <div className="game-content">
        <p>Game content for {currentGame} will go here</p>
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            username ? (
              <Home 
                username={username} 
                onSelectGame={handleSelectGame} 
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route 
          path="/login" 
          element={
            username ? (
              <Navigate to="/" />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/game" 
          element={
            currentGame ? (
              <GameContent />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;