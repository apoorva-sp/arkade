import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
import { removeUsernameCookie } from './utilities/Cookies';
import Wordlepage from './Wordlepage';

function App() {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  
  const handleLogin = (name) => {
    setUsername(name);
  };

  const handleLogout = () => {
    setUsername('');
    removeUsernameCookie();
  };

  const handleSelectGame = (gameId) => {
    // This function will be used in the Home component
    console.log(`Selected game: ${gameId}`);
    // Navigation happens in the Home component
  };

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
          path="/wordle"
          element={
            username ? (
              <Wordlepage username={username} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;