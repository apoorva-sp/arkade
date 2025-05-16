import { useNavigate } from "react-router-dom";
import "./styles/homepage.css";
import Header from "./components/Header";
import Cookies from "js-cookie";
import { useEffect, useRef } from "react";

const Home = () => {
  const navigate = useNavigate();

  const user_id = Cookies.get("user_id") ?? null;
  const alerted = useRef(false);
  useEffect(() => {
    if (user_id === null && !alerted.current) {
      alerted.current = true;
      alert("You have to enter a username at least to play");
      navigate("/");
    }
  }, [user_id, navigate]);

  const games = [
    {
      id: "wordle",
      name: "Wordle",
      description: "Word guessing game",
      color: "purple",
    },
    {
      id: "connect_4",
      name: "Connect4",
      description: "Test your memory skills",
      color: "blue",
    },
    {
      id: "wordRank",
      name: "Word Rank",
      description: "Guess the word",
      color: "green",
    },
  ];

  const gameIcons = {
    wordle: (
      <svg
        viewBox="0 0 24 24"
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
      </svg>
    ),
    connect_4: (
      <svg
        viewBox="0 0 24 24"
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <rect x="6" y="10" width="4" height="4" />
        <rect x="14" y="10" width="4" height="4" />
      </svg>
    ),
    wordRank: (
      <svg
        viewBox="0 0 24 24"
        width="32"
        height="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 14s.5-3 2-3 2.5 3 4 3 2.5-3 4-3 2 3 2 3" />
        <circle cx="18" cy="12" r="2" />
      </svg>
    ),
  };

  const handleGameClick = (gameId) => {
    if (gameId === "wordle") {
      navigate("/wordle");
    } else if (gameId === "wordRank") {
      navigate("/wordRank");
    } else if (gameId === "connect_4") {
      navigate("/connect4");
    }
  };

  return (
    <>
      <div className="home-container">
        <div className="background-glow"></div>
        <Header username={Cookies.get("username")} />
        <div className="games-grid">
          <h3 className="section-title">Choose your game</h3>
          <div className="games-list">
            {games.map((game) => (
              <div
                key={game.id}
                className={`game-card ${game.color}`}
                onClick={() => handleGameClick(game.id)}
              >
                <div className="game-content">
                  <div className="game-icon">{gameIcons[game.id]}</div>
                  <h3>{game.name}</h3>
                  <p>{game.description}</p>
                  <button className="play-now-btn">
                    Play Now
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
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
                </div>
                <div className="card-glow"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="home-container2">
        <button className="feedback-btn">Give Feedback</button>
        <p className="username">There are 4 games, you can add more!</p>
      </div>
    </>
  );
};

export default Home;
