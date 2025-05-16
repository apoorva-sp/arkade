import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Header from "./components/Header";
import Cookies from "js-cookie";
import "./styles/wordRank.css";

const Choices = [
  { choice: "country" },
  { choice: "fruits" },
  { choice: "states" },
];

function WordRank() {
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

  const [answer, setAnswer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [guess, setGuess] = useState("");
  const [aboveRows, setAboveRows] = useState([]);
  const [belowRows, setBelowRows] = useState([]);
  const [currentRow, setCurrentRow] = useState(null);
  const [usedWords, setUsedWords] = useState([]);

  const [showCongrats, setShowCongrats] = useState(false);
  const [showEndOptions, setShowEndOptions] = useState(false);
  const [shiftCongratsUp, setShiftCongratsUp] = useState(false);

  function resetGame() {
    setGuess("");
    setAboveRows([]);
    setBelowRows([]);
    setCurrentRow(null);
    setIsGameStarted(false);
    setUsedWords([]);
    setShowCongrats(false);
    setShowEndOptions(false);
    setShiftCongratsUp(false);
  }

  return (
    <>
      <div className="home-container">
        <Header username={Cookies.get("username")} />

        {isGameStarted ? (
          <>
            <Inputs
              guess={guess}
              setGuess={setGuess}
              selectedCategory={selectedCategory}
              setAboveRows={setAboveRows}
              setBelowRows={setBelowRows}
              setCurrentRow={setCurrentRow}
              usedWords={usedWords}
              setUsedWords={setUsedWords}
              setShowCongrats={setShowCongrats}
              setShowEndOptions={setShowEndOptions}
              setAnswer={setAnswer}
              setShiftCongratsUp={setShiftCongratsUp}
            />
            <GameRows
              aboveRows={aboveRows}
              belowRows={belowRows}
              currentRow={currentRow}
            />
          </>
        ) : (
          <Categories
            setAnswer={setAnswer}
            setIsGameStarted={setIsGameStarted}
            setSelectedCategory={setSelectedCategory}
            selectedCategory={selectedCategory}
            setCurrentRow={setCurrentRow}
          />
        )}

        {(showCongrats || showEndOptions) && (
          <div className="modal-wrapper">
            {showCongrats && (
              <Congratulate answer={answer} shiftUp={shiftCongratsUp} />
            )}
            {showEndOptions && (
              <GameButtons resetGame={resetGame} navigate={navigate} />
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Congratulate({ answer, shiftUp }) {
  return (
    <div className={`modal-box ${shiftUp ? "congrats-box" : ""}`}>
      <h2>🎉 Congratulations! 🎉</h2>
      <p>
        Your answer is <strong>{answer}</strong>!
      </p>
    </div>
  );
}

function GameButtons({ resetGame, navigate }) {
  return (
    <div className="modal-box">
      <h3>Would you like to play again?</h3>
      <div className="GameButtons">
        <button className="btn btn-success me-3" onClick={resetGame}>
          Play Again
        </button>
        <button className="btn btn-danger" onClick={() => navigate("/home")}>
          Quit
        </button>
      </div>
    </div>
  );
}

function Categories({
  setAnswer,
  setIsGameStarted,
  setSelectedCategory,
  selectedCategory,
  setCurrentRow,
}) {
  async function handleClick() {
    if (!selectedCategory) {
      alert("Please select a category first.");
      return;
    }

    try {
      const response = await axios.post("/word_gameAPI.php", {
        serviceID: 1,
        user_id: 18,
        choice: selectedCategory,
      });

      const data = response.data;

      if (data || data.code === 0) {
        setAnswer(data[0].secret);
        setIsGameStarted(true);
        const row = {
          word: "",
          diff: 0,
          id: Date.now() + Math.random(),
        };
        setCurrentRow(row);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
      alert("Something went wrong while fetching data.");
    }
  }

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ minHeight: "50vh" }}
    >
      <h2 className="mb-4">Select a Category</h2>
      <div className="d-flex gap-3 align-items-center">
        <div className="dropdown">
          <button
            className="btn btn-secondary dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {selectedCategory || "Choose category"}
          </button>
          <ul className="dropdown-menu">
            {Choices.map((choice) => (
              <li key={choice.choice}>
                <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCategory(choice.choice);
                  }}
                >
                  {choice.choice}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <button onClick={handleClick} className="btn btn-primary">
          Start Game
        </button>
      </div>
    </div>
  );
}

function Inputs({
  guess,
  setGuess,
  selectedCategory,
  setAboveRows,
  setBelowRows,
  setCurrentRow,
  usedWords,
  setUsedWords,
  setShowCongrats,
  setShowEndOptions,
  setAnswer,
  setShiftCongratsUp,
}) {
  async function handleGuess() {
    const normalizedGuess = guess.trim().toLowerCase();
    if (usedWords.includes(normalizedGuess)) {
      alert("You've already guessed that word!");
      return;
    }

    try {
      const response = await axios.post("/word_gameAPI.php", {
        serviceID: 2,
        user_id: 18,
        choice: selectedCategory,
        guess: normalizedGuess,
      });

      const data = response.data;

      if (data && data[1] && Array.isArray(data[1].guess)) {
        const lastGuess = data[1].guess[data[1].guess.length - 1];
        const row = {
          word: lastGuess.word,
          diff: lastGuess.diff,
          id: Date.now() + Math.random(),
        };

        setUsedWords((prev) => [...prev, normalizedGuess]);

        if (row.diff > 0) {
          setAboveRows((prev) =>
            [...prev, row].sort((a, b) => b.diff - a.diff)
          );
        } else if (row.diff < 0) {
          setBelowRows((prev) =>
            [...prev, row].sort((a, b) => b.diff - a.diff)
          );
        } else {
          setCurrentRow(row);

          setTimeout(() => {
            setShowCongrats(true);
          }, 1000);

          setTimeout(() => {
            setShiftCongratsUp(true);
            setShowEndOptions(true);
          }, 3000);
        }

        setGuess("");
      } else {
        alert(data.message || "Unexpected API response.");
      }
    } catch (error) {
      console.error("Error guessing:", error);
      alert("Failed to send guess.");
    }
  }

  return (
    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
      <input
        type="text"
        className="form-control"
        placeholder="Enter your guess"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
      />
      <button className="btn btn-primary btn-lg" onClick={handleGuess}>
        Play
      </button>
    </div>
  );
}

function GameRows({ aboveRows, currentRow, belowRows }) {
  const rowStyle = {
    display: "flex",
    minHeight: "36px",
    margin: "6px 0",
    borderRadius: "6px",
    overflow: "hidden",
    fontWeight: "500",
    fontSize: "15px",
  };

  const leftColStyle = {
    flex: 3,
    backgroundColor: "#43A047",
    color: "black",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    fontWeight: "bold",
  };

  const rightColStyle = {
    flex: 1,
    backgroundColor: "#FFB74D",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
    fontWeight: "bold",
  };

  const renderRow = (row) => (
    <div key={row.id} style={rowStyle}>
      <div style={leftColStyle}>{row.word}</div>
      <div style={rightColStyle}>{row.diff}</div>
    </div>
  );

  return (
    <div style={{ marginTop: "20px", padding: "0 10px" }}>
      {aboveRows.map(renderRow)}
      {currentRow && renderRow(currentRow)}
      {belowRows.map(renderRow)}
    </div>
  );
}

export default WordRank;
