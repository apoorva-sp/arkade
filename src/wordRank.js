import React, { useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import Cookies from "js-cookie";

const Choices = [
  { choice: "country" },
  { choice: "fruits" },
  { choice: "states" },
];

function WordRank() {
  const [answer, setAnswer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [guess, setGuess] = useState("");
  const [aboveRows, setAboveRows] = useState([]);
  const [belowRows, setBelowRows] = useState([]);
  const [currentRow, setCurrentRow] = useState(null);

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
      </div>
    </>
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

      {/* Side-by-side row */}
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
}) {
  async function handleGuess() {
    try {
      const response = await axios.post("/word_gameAPI.php", {
        serviceID: 2,
        user_id: 18,
        choice: selectedCategory,
        guess: guess,
      });

      const data = response.data;

      if (data && data[1] && Array.isArray(data[1].guess)) {
        const lastGuess = data[1].guess[data[1].guess.length - 1];
        const row = {
          word: lastGuess.word,
          diff: lastGuess.diff,
          id: Date.now() + Math.random(),
        };

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
        style={{
          backgroundColor: "#1C1F2A",
          color: "#EDEDED",
          border: "1px solid #5C6BC0",
        }}
        placeholder="Enter your guess"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
      />
      <button
        className="btn"
        style={{
          backgroundColor: "#5C6BC0",
          color: "#fff",
        }}
        onClick={handleGuess}
      >
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
    backgroundColor: "#23797A", // dark teal
    color: "#EDEDED",
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
  };

  const rightColStyle = {
    flex: 1,
    backgroundColor: "#FFB74D", // soft orange
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px",
  };

  const correctGuessStyle = {
    ...leftColStyle,
    backgroundColor: "#43A047", // green for correct guess
  };

  const renderRow = (row) => (
    <div key={row.id} style={rowStyle}>
      <div style={row.diff === 0 ? correctGuessStyle : leftColStyle}>
        {row.word}
      </div>
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
