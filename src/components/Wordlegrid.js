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
            const rowBitmap = bitmaps[rowIndex] || "";
            const status = rowBitmap.charAt(colIndex);

            let className = "wordle-box ";
            if (status === "2") className += "green";
            else if (status === "1") className += "yellow";
            else if (status === "0") className += "gray";

            return (
              <div key={colIndex} className={className}>
                {char}
              </div>
            );
          })}
        </div>
      ))}

      {/* Current guess row */}
      <form
        className="wordle-guess-wrapper"
        onSubmit={(e) => {
          e.preventDefault(); // Prevent page reload
          if (guess.length === wordLength) guessWord();
        }}
      >
        <label htmlFor="guessInput">Enter Your Guess:</label>
        <input
          type="text"
          id="guessInput"
          className="guess-input"
          value={guess}
          onChange={(e) => {
            const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
            if (value.length <= wordLength) setGuess(value);
          }}
          maxLength={wordLength}
          autoFocus
        />
        <button
          type="submit"
          className="guess-button"
          disabled={guess.length !== wordLength}
        >
          Guess
        </button>
      </form>
    </div>
  );
}
