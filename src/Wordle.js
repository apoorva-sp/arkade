<<<<<<< HEAD
import { useState, useEffect } from "react";
=======
import { useState, useEffect, use } from "react";
>>>>>>> a091406 (changed)
import Cookies from "js-cookie";
import axios from "axios";
import "./styles/wordle.css";
import Header from "./components/Header.js";

<<<<<<< HEAD
// WordleGrid Component
function WordleGrid({
  wordLength,
  guess,
  setGuess,
  guessWord,
  guesses,
  bitmaps,
}) {
  return (
    <div className="wordle-grid">
      {/* Render past guesses */}
      {guesses.map((word, rowIndex) => (
        <div key={rowIndex} className="wordle-row">
          {word.split("").map((char, colIndex) => {
            // Get the correct bitmap string for this row
            const rowBitmap = bitmaps[rowIndex] || "";
            // Get the individual character from the bitmap string
            const status = rowBitmap.charAt(colIndex);
            let className = "wordle-box ";
            // Change comparison to check for the correct values
            if (status === "2") className += "green";
            else if (status === "1") className += "yellow";
            else if (status === "0") className += "gray"; // This is the key change
            return (
              <div key={colIndex} className={className}>
                {char}
              </div>
            );
          })}
        </div>
      ))}
      {/* Current guess row */}
      <div className="wordle-guess-wrapper">
        <label htmlFor="guessInput">Enter Your Guess:</label>
        <input
          type="text"
          id="guessInput"
          className="guess-input"
          value={guess}
          onChange={(e) => {
            const value = e.target.value.toLowerCase(); // Convert to lowercase
            if (value.length <= wordLength) setGuess(value);
          }}
          maxLength={wordLength}
        />
        <button
          type="button"
          className="guess-button"
          onClick={guessWord}
          disabled={guess.length !== wordLength}
        >
          Guess
        </button>
      </div>
    </div>
  );
}

// Main WordleGame Component
=======
>>>>>>> a091406 (changed)
export default function WordleGame() {
  const user_id = Cookies.get("user_id");
  const url = "/wordleAPI.php";
  const [isLoading, setIsLoading] = useState(false);
<<<<<<< HEAD
  const [word, setWord] = useState("");
  const [guess, setGuess] = useState("");
=======

  const [word, setWord] = useState("");
  const [guess, setGuess] = useState("");

>>>>>>> a091406 (changed)
  const [guesses, setGuesses] = useState([]);
  const [bitmaps, setBitmaps] = useState([]);
  const [secret, setSecret] = useState("");
  const [lives, setLives] = useState("");
<<<<<<< HEAD
  const [gamePlaying, setGamePlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [wordLength, setWordLength] = useState(5);
  
  // Add debug logging to check bitmap format when it changes
  useEffect(() => {
    console.log("Current bitmaps:", bitmaps);
  }, [bitmaps]);
  
  const resetGame = () => {
    setGamePlaying(false);
    setGameOver(false);
    setGameWon(false);
    setGuess("");
    setGuesses([]);
    setBitmaps([]);
    setSecret("");
  };
  
=======

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

>>>>>>> a091406 (changed)
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
<<<<<<< HEAD
          // Initialize other state if needed
          setGuesses([]);
          setBitmaps([]);
          setGameOver(false);
          setGameWon(false);
=======
>>>>>>> a091406 (changed)
        } else {
          alert(response.data.message);
        }
      } catch (error) {
        console.error(`Starting game error`, error);
        alert("Something went wrong. Please try again.");
      }
      setIsLoading(false);
    };
<<<<<<< HEAD
    
=======

>>>>>>> a091406 (changed)
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
<<<<<<< HEAD
        <button 
          className="start-game-button" 
          onClick={handleStart}
          disabled={isLoading}
        >
          {isLoading ? "Starting..." : "Start Game"}
=======

        <button className="start-game-button" onClick={handleStart}>
          Start Game
>>>>>>> a091406 (changed)
        </button>
      </div>
    );
  };
<<<<<<< HEAD
  
  const guessWord = async () => {
    if (!guess || guess.length !== wordLength) return;
=======

  const guessWord = async () => {
    if (!guess) return;
>>>>>>> a091406 (changed)
    setIsLoading(true);
    try {
      const response = await axios.post(url, {
        word: guess,
        user_id,
        serviceID: 2,
<<<<<<< HEAD
      });    
      console.log("API Response:", response.data);
      console.log("API Response bitmaps:", JSON.stringify(response.data.bitmaps));
      
=======
      });
>>>>>>> a091406 (changed)
      if (response.data.code === 0) {
        setSecret(response.data.secret);
        setLives(response.data.lives);
        setGamePlaying(response.data.playing);
        setGuesses(response.data.guesses);
<<<<<<< HEAD
        
        // Check if game is over
        if (!response.data.playing) {
          setGameOver(true);
          if (response.data.secret && guess.toLowerCase() === response.data.secret.toLowerCase()) {
            setGameWon(true);
          }
        }
        
        // Check if player won by guessing the correct word
        // This handles cases where the API might not set playing=false on win
        if (response.data.secret && guess.toLowerCase() === response.data.secret.toLowerCase()) {
          setGameWon(true);
          setGameOver(true);
          setGamePlaying(false);
        }
        
        // Log and examine the bitmaps
        const newBitmaps = response.data.bitmaps;
        console.log("New bitmaps from API (raw):", newBitmaps);
        console.log("New bitmaps type:", typeof newBitmaps);
        console.log("New bitmaps is array?", Array.isArray(newBitmaps));
        console.log("New bitmaps stringified:", JSON.stringify(newBitmaps));
        
        // Process the bitmaps if necessary
        let processedBitmaps = newBitmaps;
        
        // If bitmaps is a string like ["00000" "00000"], convert to proper array
        if (typeof newBitmaps === 'string') {
          try {
            // Handle the possibility that it's a malformed JSON string
            processedBitmaps = JSON.parse(newBitmaps.replace(/"\s+"/g, '", "'));
          } catch (e) {
            console.error("Error parsing bitmaps:", e);
            // Split the string by spaces and remove quotes
            processedBitmaps = newBitmaps
              .replace(/[\[\]"]/g, '')
              .split(/\s+/)
              .filter(item => item.length > 0);
          }
        }
        
        console.log("Processed bitmaps:", processedBitmaps);
        setBitmaps(processedBitmaps);
        
=======
        setBitmaps(response.data.bitmaps);
        updateBoard();
>>>>>>> a091406 (changed)
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
<<<<<<< HEAD
  
  return (
    <div className="home-container">
      <Header username={Cookies.get("username")} />
      {gamePlaying && !gameOver ? (
        <div>
          {lives && <div className="lives-remaining">Lives: {lives}</div>}
          <WordleGrid
            wordLength={wordLength}
            guess={guess}
            setGuess={setGuess}
            guessWord={guessWord}
            guesses={guesses}
            bitmaps={bitmaps}
          />
        </div>
      ) : gameOver ? (
        <div className="game-over-container">
          <h2>{gameWon ? "Congratulations! You won!" : "Game Over!"}</h2>
          {!gameWon && secret && <p>The word was: <strong>{secret}</strong></p>}
          {gameWon && <p>You correctly guessed: <strong>{secret}</strong></p>}
          <button 
            className="play-again-button" 
            onClick={resetGame}
          >
            Play Again
          </button>
        </div>
      ) : (
        <WordleOptions />
      )}
    </div>
  );
}
=======

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
>>>>>>> a091406 (changed)
