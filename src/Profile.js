import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./styles/homepage.css"; // Existing CSS
import "./styles/profile.css"; // New CSS
import Header from "./components/Header";
import API_URL from "./config";

export default function Profile() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUsername = Cookies.get("username");
    if (!storedUsername) {
      navigate("/login");
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);

  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!newUsername.trim()) {
      setError("New username cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(API_URL + "/usersAPI.php", {
        serviceID: 4,
        oldUsername: username,
        newUsername: newUsername.trim(),
      });

      if (response.data.code === 0) {
        setMessage("Username updated successfully!");
        setUsername(newUsername.trim());
        Cookies.set("username", newUsername.trim(), { expires: 7 });
        setNewUsername("");
      } else {
        setError(`Error updating username: ${response.data.message}`);
      }
    } catch (err) {
      setError(`Server error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <Header username={username} />
      <div className="profile-wrapper">
        <div className="profile-card">
          <h2 className="profile-title">Profile Settings</h2>
          <p className="profile-current">
            Current Username: <strong>{username}</strong>
          </p>

          {loading && <p className="profile-info">Loading...</p>}
          {error && <p className="profile-error">{error}</p>}
          {message && <p className="profile-success">{message}</p>}

          <form className="profile-form" onSubmit={handleUsernameUpdate}>
            <label htmlFor="newUsername">New Username:</label>
            <input
              type="text"
              id="newUsername"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              className="profile-input"
              disabled={loading}
            />
            <button
              type="submit"
              className="profile-button"
              disabled={loading || !newUsername.trim()}
            >
              Update Username
            </button>
          </form>
          <button
            onClick={() => {
              Cookies.remove("username");
              Cookies.remove("user_id");
              navigate("/");
            }}
            className="profile-button"
            style={{ marginTop: "1rem" }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
