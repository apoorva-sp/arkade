import { useState, useEffect, use } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import "./styles/wordle.css";
import Header from "./components/Header.js";

export default function WordleGame() {
  const user_id = Cookies.get("user_id");
  const url = "/wordleAPI.php";
  const [isLoading, setIsLoading] = useState(false);

  const [word, setWord] = useState("");
  const [guess, setGuess] = useState("");

  const [guesses, setGuesses] = useState([]);
  const [bitmaps, setBitmaps] = useState([]);
  const [secret, setSecret] = useState("");
  const [lives, setLives] = useState("");

  const [gamePlaying, setGamePlaying] = useState(false);
  const [wordLength, setWordLength] = useState(5);

  const WordleGrid = () => {
    const rows = wordLength + 1;
    const columns = wordLength;
    const [grid] = useState(
      Array.from({ length: rows }, () => Array(columns).fill(""))
    );

    return (
      <div className="wordle-grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="wordle-row">
            {row.map((_, colIndex) => (
              <div key={colIndex} className="wordle-box"></div>
            ))}
          </div>
        ))}
        <div className="wordle-guess-wrapper">
          <label htmlFor="guessInput">Enter Your Guess:</label>
          <input
            type="text"
            id="guessInput"
            className="guess-input"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
          />

          <button className="guess-button" onClick={guessWord}>
            Guess
          </button>
        </div>
      </div>
    );
  };

  const WordleOptions = () => {
    const handleStart = async () => {
      setIsLoading(true);
      try {
        const response = await axios.post(url, {
          user_id,
          length: wordLength,
          serviceID: 1,
        });
        if (response.data.code === 0) {
          setGamePlaying(true);
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.error(`Starting game error`, error);
        alert("Something went wrong. Please try again.");
      }
      setIsLoading(false);
    };

    return (
      <div className="wordle-options-wrapper">
        <label htmlFor="wordLength">Select Word Length: </label>
        <select
          id="wordLength"
          className="wordle-dropdown"
          value={wordLength}
          onChange={(e) => setWordLength(parseInt(e.target.value))}
        >
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
          <option value={6}>6</option>
        </select>

        <button className="start-game-button" onClick={handleStart}>
          Start Game
        </button>
      </div>
    );
  };

  const guessWord = async () => {
    if (!guess) return;
    setIsLoading(true);
    try {
      const response = await axios.post(url, {
        word: guess,
        user_id,
        serviceID: 2,
      });
      if (response.data.code === 0) {
        setSecret(response.data.secret);
        setLives(response.data.lives);
        setGamePlaying(response.data.playing);
        setGuesses(response.data.guesses);
        setBitmaps(response.data.bitmaps);
        updateBoard();
        setGuess(""); // clear input after submission
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  };

  const updateBoard = () => {
    //todo
  };

  return (
    <div className="home-container">
      <Header username={Cookies.get("username")} />
      {gamePlaying ? <WordleGrid /> : <WordleOptions />}
    </div>
  );
}
