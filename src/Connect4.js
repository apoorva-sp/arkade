"use client";

import React, { useState } from "react";

function ConnectFourApp() {
  // Constants
  const ROWS = 6;
  const COLS = 7;
  const EMPTY = null;
  const PLAYER_1 = "red";
  const PLAYER_2 = "yellow";

  // Game state
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_1);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [winningCells, setWinningCells] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  // Create an empty board
  function createEmptyBoard() {
    return Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(EMPTY));
  }

  // Handle column click
  const handleColumnClick = (colIndex) => {
    if (gameOver) return;

    // Find the lowest empty cell in the column
    const newBoard = [...board];
    for (let rowIndex = ROWS - 1; rowIndex >= 0; rowIndex--) {
      if (newBoard[rowIndex][colIndex] === EMPTY) {
        newBoard[rowIndex][colIndex] = currentPlayer;
        setBoard(newBoard);

        // Check for win
        const winResult = checkWin(newBoard, rowIndex, colIndex, currentPlayer);
        if (winResult.win) {
          setWinner(currentPlayer);
          setWinningCells(winResult.cells);
          setGameOver(true);
          return;
        }

        // Check for draw
        if (checkDraw(newBoard)) {
          setIsDraw(true);
          setGameOver(true);
          return;
        }

        // Switch player
        setCurrentPlayer(currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1);
        return;
      }
    }
  };

  // Check if the board is full (draw)
  const checkDraw = (board) => {
    return board[0].every((cell) => cell !== EMPTY);
  };

  // Check for win
  const checkWin = (board, row, col, player) => {
    const directions = [
      [0, 1], // horizontal
      [1, 0], // vertical
      [1, 1], // diagonal down-right
      [1, -1], // diagonal down-left
    ];

    for (const [dx, dy] of directions) {
      const cells = [];

      // Check in both directions
      for (let i = -3; i <= 3; i++) {
        const newRow = row + i * dx;
        const newCol = col + i * dy;

        if (
          newRow >= 0 &&
          newRow < ROWS &&
          newCol >= 0 &&
          newCol < COLS &&
          board[newRow][newCol] === player
        ) {
          cells.push([newRow, newCol]);

          // If we have 4 consecutive cells, we have a win
          if (cells.length >= 4) {
            // Check if they're consecutive
            let consecutive = true;
            for (let j = 1; j < 4; j++) {
              const prevRow = cells[j - 1][0];
              const prevCol = cells[j - 1][1];
              const currRow = cells[j][0];
              const currCol = cells[j][1];

              if (
                Math.abs(currRow - prevRow) > 1 ||
                Math.abs(currCol - prevCol) > 1
              ) {
                consecutive = false;
                break;
              }
            }

            if (consecutive) {
              return { win: true, cells: cells.slice(0, 4) };
            }
          }
        } else {
          cells.length = 0;
        }
      }
    }

    return { win: false, cells: [] };
  };

  // Reset the game
  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(PLAYER_1);
    setWinner(null);
    setIsDraw(false);
    setWinningCells([]);
    setGameOver(false);
  };

  // Determine if a cell is part of the winning combination
  const isWinningCell = (row, col) => {
    return winningCells.some(([r, c]) => r === row && c === col);
  };

  // Styles
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "16px",
      fontFamily: "Arial, sans-serif",
    },
    statusContainer: {
      marginBottom: "16px",
      textAlign: "center",
    },
    currentPlayer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      justifyContent: "center",
    },
    playerIndicator: {
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      backgroundColor: currentPlayer === PLAYER_1 ? "red" : "yellow",
    },
    alertBox: {
      padding: "16px",
      border: "1px solid",
      borderRadius: "8px",
      marginBottom: "16px",
      backgroundColor: "#f8f9fa",
      borderColor: winner ? "#28a745" : "#6c757d",
    },
    winnerText: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    winnerIndicator: {
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      backgroundColor: winner === PLAYER_1 ? "red" : "yellow",
    },
    boardContainer: {
      backgroundColor: "#2563eb", // blue-600
      padding: "8px",
      border: "4px solid #1e40af", // blue-800
      borderRadius: "8px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    },
    boardContent: {
      padding: "8px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "8px",
    },
    columnButton: {
      height: "32px",
      backgroundColor: "#3b82f6", // blue-500
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    columnButtonHover: {
      backgroundColor: "#1d4ed8", // blue-700
    },
    columnButtonDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    cell: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      backgroundColor: "#bfdbfe", // blue-200
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    cellWinning: {
      boxShadow: "0 0 0 4px #22c55e, 0 0 0 6px white", // green-500
    },
    piece: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      transition: "all 0.3s",
    },
    resetButton: {
      marginTop: "16px",
      padding: "8px 16px",
      border: "1px solid #d1d5db",
      borderRadius: "4px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      backgroundColor: "white",
      transition: "background-color 0.2s",
    },
    resetButtonHover: {
      backgroundColor: "#f3f4f6",
    },
  };

  return (
    <div style={styles.container}>
      {/* Game status */}
      <div style={styles.statusContainer}>
        {!gameOver && (
          <div style={styles.currentPlayer}>
            <span>Current Player:</span>
            <div style={styles.playerIndicator} />
          </div>
        )}

        {winner && (
          <div style={styles.alertBox}>
            <div style={{ fontWeight: "bold" }}>Winner!</div>
            <div style={styles.winnerText}>
              Player
              <div style={styles.winnerIndicator} />
              has won the game!
            </div>
          </div>
        )}

        {isDraw && (
          <div style={styles.alertBox}>
            <div style={{ fontWeight: "bold" }}>Draw!</div>
            <div>The game ended in a draw.</div>
          </div>
        )}
      </div>

      {/* Game board */}
      <div style={styles.boardContainer}>
        <div style={styles.boardContent}>
          <div style={styles.grid}>
            {/* Column buttons */}
            {Array(COLS)
              .fill(null)
              .map((_, colIndex) => (
                <button
                  key={`col-${colIndex}`}
                  onClick={() => handleColumnClick(colIndex)}
                  disabled={board[0][colIndex] !== EMPTY || gameOver}
                  style={{
                    ...styles.columnButton,
                    ...(board[0][colIndex] !== EMPTY || gameOver
                      ? styles.columnButtonDisabled
                      : {}),
                  }}
                  onMouseOver={(e) => {
                    if (board[0][colIndex] === EMPTY && !gameOver) {
                      e.currentTarget.style.backgroundColor =
                        styles.columnButtonHover.backgroundColor;
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor =
                      styles.columnButton.backgroundColor;
                  }}
                >
                  ↓
                </button>
              ))}

            {/* Game cells */}
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  style={{
                    ...styles.cell,
                    ...(isWinningCell(rowIndex, colIndex)
                      ? styles.cellWinning
                      : {}),
                  }}
                >
                  {cell && (
                    <div
                      style={{
                        ...styles.piece,
                        backgroundColor: cell === PLAYER_1 ? "red" : "yellow",
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Reset button */}
      <button
        onClick={resetGame}
        style={styles.resetButton}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor =
            styles.resetButtonHover.backgroundColor;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "white";
        }}
      >
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
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
        </svg>
        Reset Game
      </button>
    </div>
  );
}
export default ConnectFourApp;
