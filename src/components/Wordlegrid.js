import React from "react";

export default function WordleGrid({
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
            const value = e.target.value.toUpperCase(); // Auto-capitalize
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