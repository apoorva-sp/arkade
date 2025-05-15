import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import "./styles/wordle.css";
import Header from "./components/Header.js";

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
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [wordLength, setWordLength] = useState(5);
  
  // Add debug logging to check bitmap format when it changes
  useEffect(() => {
    console.log("Current bitmaps:", bitmaps);
  }, [bitmaps]);
  
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
          // Initialize other state if needed
          setGuesses([]);
          setBitmaps([]);
          setGameOver(false);
          setGameWon(false);
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
        <button 
          className="start-game-button" 
          onClick={handleStart}
          disabled={isLoading}
        >
          {isLoading ? "Starting..." : "Start Game"}
        </button>
      </div>
    );
  };
  
  const guessWord = async () => {
    if (!guess || guess.length !== wordLength) return;
    setIsLoading(true);
    try {
      const response = await axios.post(url, {
        word: guess,
        user_id,
        serviceID: 2,
      });    
      console.log("API Response:", response.data);
      console.log("API Response bitmaps:", JSON.stringify(response.data.bitmaps));
      
      if (response.data.code === 0) {
        setSecret(response.data.secret);
        setLives(response.data.lives);
        setGamePlaying(response.data.playing);
        setGuesses(response.data.guesses);
        
        // Check if game is over
        if (!response.data.playing) {
          setGameOver(true);
          if (response.data.secret && guess.toLowerCase() === response.data.secret.toLowerCase()) {
            setGameWon(true);
          }
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
          <button 
            className="play-again-button" 
            onClick={() => {
              setGamePlaying(false);
              setGameOver(false);
              setGameWon(false);
              setGuess("");
              setGuesses([]);
              setBitmaps([]);
            }}
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