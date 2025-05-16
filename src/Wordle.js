import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./styles/wordle.css";
import Header from "./components/Header.js";

function WordleGrid({
  wordLength,
  guess,
  setGuess,
  guessWord,
  guesses,
  bitmaps,
}) {
  const totalRows =
    guesses.length < wordLength + 1 ? wordLength + 1 : guesses.length + 1;

  return (
    <div className="wordle-grid">
      {Array.from({ length: totalRows }, (_, rowIndex) => {
        if (rowIndex < guesses.length) {
          // Render guessed rows
          const word = guesses[rowIndex];
          const rowBitmap = bitmaps[rowIndex] || "";
          return (
            <div key={rowIndex} className="wordle-row">
              {word.split("").map((char, colIndex) => {
                const status = rowBitmap.charAt(colIndex);
                let className = "wordle-box ";
                if (status === "2") className += "green";
                else if (status === "1") className += "yellow";
                else if (status === "0") className += "gray";
                return (
                  <div key={colIndex} className={className}>
                    {char.toUpperCase()}
                  </div>
                );
              })}
            </div>
          );
        } else if (rowIndex === guesses.length) {
          // Render current guess row
          return (
            <div key={rowIndex} className="wordle-row current-guess">
              {[...Array(wordLength)].map((_, idx) => (
                <div key={idx} className="wordle-box">
                  {guess[idx] ? guess[idx].toUpperCase() : ""}
                </div>
              ))}
            </div>
          );
        } else {
          // Render future empty row
          return (
            <div key={rowIndex} className="wordle-row">
              {[...Array(wordLength)].map((_, idx) => (
                <div key={idx} className="wordle-box empty" />
              ))}
            </div>
          );
        }
      })}

      <div className="wordle-guess-wrapper">
        <label htmlFor="guessInput">Enter Your Guess:</label>
        <input
          type="text"
          id="guessInput"
          className="guess-input"
          value={guess}
          onChange={(e) => {
            const val = e.target.value.toLowerCase();
            if (val.length <= wordLength && /^[a-z]*$/.test(val)) setGuess(val);
          }}
          maxLength={wordLength}
          disabled={false}
          autoFocus
        />
        <button type="button" className="guess-button" onClick={guessWord}>
          Guess
        </button>
      </div>
    </div>
  );
}

export default function WordleGame() {
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

  const url = "/wordleAPI.php";

  const [isLoading, setIsLoading] = useState(false);
  const [wordLength, setWordLength] = useState(5);
  const [gamePlaying, setGamePlaying] = useState(false);
  const [first, setFirst] = useState(true);
  const [gameWon, setGameWon] = useState(false);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [bitmaps, setBitmaps] = useState([]);
  const [secret, setSecret] = useState("");
  const [lives, setLives] = useState(0);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (gamePlaying) {
        event.preventDefault();
        event.returnValue = ""; // Required for Chrome
      }
    };

    const handlePopState = async () => {
      if (gamePlaying) {
        const confirmExit = window.confirm("Do you want to exit the game?");
        if (confirmExit) {
          await exitGame();
        } else {
          window.history.pushState(null, null, window.location.pathname);
        }
      }
    };
    if (gamePlaying) {
      window.history.pushState(null, null, window.location.pathname);
    }

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [gamePlaying]);

  const WordleOptions = ({ first }) => (
    <div className="wordle-options-wrapper">
      <div className="wordle-select-wrapper">
        <label htmlFor="wordLength">Select Word Length: </label>
        <select
          id="wordLength"
          className="wordle-dropdown"
          value={wordLength}
          onChange={(e) => setWordLength(parseInt(e.target.value, 10))}
          disabled={isLoading}
        >
          {[3, 4, 5, 6].map((len) => (
            <option key={len} value={len}>
              {len}
            </option>
          ))}
        </select>
      </div>

      {first ? (
        <button
          className="start-game-button"
          onClick={handleStart}
          disabled={isLoading}
        >
          {isLoading ? "Starting..." : "Start Game"}
        </button>
      ) : (
        <>
          <button className="start-game-button" onClick={resetGame}>
            Play Again
          </button>
          <button className="exit-game-button" onClick={exitGame}>
            Exit Game
          </button>
        </>
      )}
    </div>
  );

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
        setGameWon(false);
        setGuesses([]);
        setBitmaps([]);
        setSecret("");
        setLives(response.data.lives || 0);
        setGuess("");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Starting game error:", error);
      alert("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  };

  const guessWord = async () => {
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
        setGuess("");
        let newBitmaps = response.data.bitmaps;
        if (typeof newBitmaps === "string") {
          try {
            newBitmaps = JSON.parse(newBitmaps.replace(/"\s+"/g, '", "'));
          } catch {
            newBitmaps = newBitmaps
              .replace(/[\[\]"]/g, "")
              .split(/\s+/)
              .filter((item) => item.length > 0);
          }
        }
        setBitmaps(newBitmaps);

        if (!response.data.playing) {
          setGamePlaying(false);
          if (guess.toLowerCase() === response.data.secret.toLowerCase()) {
            setGameWon(true);
          }
          setFirst(false);
        }
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  };

  const resetGame = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(url, {
        user_id,
        length: wordLength,
        serviceID: 4,
      });
      if (response.data.code === 0) {
        setGamePlaying(true);
        setGameWon(false);
        setGuesses([]);
        setBitmaps([]);
        setSecret("");
        setLives(response.data.lives);
        setGuess("");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Starting game error:", error);
      alert("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  };

  const exitGame = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(url, {
        user_id,
        length: wordLength,
        serviceID: 3,
      });
      if (response.data.code === 0) {
        navigate("/home");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Starting game error:", error);
      alert("Something went wrong. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="home-container">
      <Header username={Cookies.get("username")} />

      {gamePlaying ? (
        <>
          <div className="lives-remaining">Lives: {lives}</div>
          <WordleGrid
            wordLength={wordLength}
            guess={guess}
            setGuess={setGuess}
            guessWord={guessWord}
            guesses={guesses}
            bitmaps={bitmaps}
          />
        </>
      ) : !first ? (
        <div className="game-over-container">
          <h2>{gameWon ? "🎉 Congratulations! You won! 🎉" : "Game Over!"}</h2>
          <p>
            The word was: <strong>{secret.toUpperCase()}</strong>
          </p>
          {gameWon && (
            <p>
              You correctly guessed: <strong>{secret.toUpperCase()}</strong>
            </p>
          )}
          <WordleOptions first={false} />
        </div>
      ) : (
        <WordleOptions first={true} />
      )}
    </div>
  );
}
