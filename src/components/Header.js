import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header({ username }) {
  const navigate = useNavigate();
  
  const handleProfileClick = () => {
    navigate('/profile'); // Navigate to the profile route when username is clicked
  };

  return (
    <>
      <header className="home-header">
        <div className="logo-area">
          <div className="logo-icon"></div>
          <h1>Arkade</h1>
        </div>
        <div className="user-welcome">
          <button className="username" onClick={handleProfileClick}>{username}</button>
        </div>
      </header>
    </>
  );
}