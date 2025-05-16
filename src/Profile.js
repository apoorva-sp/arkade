import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./styles/homepage.css";
import Header from "./components/Header";

export default function Profile() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // On mount, get username from cookie, redirect if none
  useEffect(() => {
    const storedUsername = Cookies.get("username");
    if (!storedUsername) {
      navigate("/login");
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);

  // Handle username update form submission
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
      const response = await axios.post("/usersAPI.php", {
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
      <Header username={Cookies.get("username")} />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      <form onSubmit={handleUsernameUpdate}>
        <label htmlFor="newUsername">New Username:</label>
        <input
          type="text"
          id="newUsername"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="Enter new username"
        />
        <button type="submit" disabled={loading || !newUsername.trim()}>
          Update Username
        </button>
      </form>
    </div>
  );
}
