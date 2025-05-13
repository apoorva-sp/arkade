import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/loginstyle.css";
import "./styles/loadingstyle.scss";
import axios from "axios";
import Cookies from "js-cookie";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signUp, setSignUp] = useState(true);
  const [secure, setSecure] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const trimmedUsername = username.trim();
    try {
      const serviceID = signUp ? 1 : 2;
      setPassword((prev) => (secure ? prev : ""));
      const response = await axios.post("/usersAPI.php", {
        username: trimmedUsername,
        password,
        serviceID,
      });

      if (response.data.code === 0) {
        Cookies.set("username", trimmedUsername);
        Cookies.set("user_id", response.data.user_id);
        navigate("/home");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(`${signUp ? "Sign up" : "Login"} error:`, error);
      alert("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setSignUp((prev) => !prev);
  };
  const toggleSecure = () => {
    setSecure((prev) => !prev);
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
          {secure ? (
            <div className="input-group">
              <input
                type="text"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          ) : null}

          <button type="submit" className="play-button" disabled={loading}>
            <span>{signUp ? "Sign Up" : "Login"}</span>
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

          <div className="toggle-auth">
            {signUp ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              className="toggle-button"
              onClick={toggleMode}
            >
              {signUp ? "Login" : "Sign Up"}
            </button>
          </div>
          <div className="toggle-auth">
            {!secure ? "Secure your account? " : "Just play the game"}{" "}
            <button
              type="button"
              className="toggle-button"
              onClick={toggleSecure}
            >
              {!secure ? "Secure" : "Just Play"}
            </button>
          </div>

          {loading ? (
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : null}
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
