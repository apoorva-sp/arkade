import React, { useState } from "react";
import "./styles/loginstyle.css";
import './styles/loadingstyle.scss'
import { setUsernameCookie } from "./utilities/Cookies";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  console.log(username);

  const handleSubmit = (e) => {
    e.preventDefault();
    setUsernameCookie(username)
    if (username.trim()) {
      onLogin(username);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-shape"></div>
          <h1>Arkade</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <button type="submit" className="play-button">
            <span>Let's Play!</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </button>
          <div className="spinner-border" role="status">
            <span className="visually-hidden" >Loading...</span>
          </div>
        </form>
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
