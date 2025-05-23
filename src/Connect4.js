// ConnectFourApp.jsx
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Header from "./components/Header";
import "./styles/connect4.css";

function ConnectFourApp() {
  // Constants
  const ROWS = 6;
  const COLS = 7;
  const EMPTY = null;
  const PLAYER_1 = "red";
  const PLAYER_2 = "yellow";

  // Game state
  const [username, setUsername] = useState("");
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_1);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [winningCells, setWinningCells] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const name = Cookies.get('username');
    if (name) setUsername(name);
  }, []);

  function createEmptyBoard() {
    return Array(ROWS)
      .fill(null)
      .map(() => Array(COLS).fill(EMPTY));
  }

  const handleColumnClick = (colIndex) => {
    if (gameOver) return;

    const newBoard = board.map(row => [...row]);
    for (let rowIndex = ROWS - 1; rowIndex >= 0; rowIndex--) {
      if (newBoard[rowIndex][colIndex] === EMPTY) {
        newBoard[rowIndex][colIndex] = currentPlayer;
        setBoard(newBoard);

        const winResult = checkWin(newBoard, rowIndex, colIndex, currentPlayer);
        if (winResult.win) {
          setWinner(currentPlayer);
          setWinningCells(winResult.cells);
          setGameOver(true);
          return;
        }

        if (checkDraw(newBoard)) {
          setIsDraw(true);
          setGameOver(true);
          return;
        }

        setCurrentPlayer(currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1);
        return;
      }
    }
  };

  const checkDraw = (board) => board[0].every(cell => cell !== EMPTY);

  const checkWin = (board, row, col, player) => {
    const directions = [[0,1],[1,0],[1,1],[1,-1]];
    for (const [dx, dy] of directions) {
      const cells = [];
      for (let i = -3; i <= 3; i++) {
        const newRow = row + i*dx;
        const newCol = col + i*dy;
        if (
          newRow >= 0 && newRow < ROWS &&
          newCol >= 0 && newCol < COLS &&
          board[newRow][newCol] === player
        ) {
          cells.push([newRow, newCol]);
          if (cells.length >= 4) {
            let consecutive = true;
            for (let j = 1; j < 4; j++) {
              const [pr, pc] = cells[j-1];
              const [cr, cc] = cells[j];
              if (Math.abs(cr-pr) > 1 || Math.abs(cc-pc) > 1) {
                consecutive = false;
                break;
              }
            }
            if (consecutive) return { win: true, cells: cells.slice(0,4) };
          }
        } else {
          cells.length = 0;
        }
      }
    }
    return { win: false, cells: [] };
  };

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(PLAYER_1);
    setWinner(null);
    setIsDraw(false);
    setWinningCells([]);
    setGameOver(false);
  };

  const isWinningCell = (row, col) => winningCells.some(([r, c]) => r===row && c===col);

  return (
    <div className="connectFourApp">
      <Header username={username} />        {/* Moved inside full-page wrapper */}
      <div className="container">
        {/* Game status, board, and reset button */}
        {!gameOver && (
          <div className="currentPlayer">
            <span>Current Player:</span>
            <div className={`playerIndicator ${currentPlayer === PLAYER_1 ? 'player1' : 'player2'}`} />
          </div>
        )}
        {winner && (
          <div className={`alertBox winner`}>
            <div className="alertTitle">Winner!</div>
            <div className="winnerText">
              Player
              <div className={`winnerIndicator ${winner === PLAYER_1 ? 'player1' : 'player2'}`} />
              has won the game!
            </div>
          </div>
        )}
        {isDraw && (
          <div className="alertBox draw">
            <div className="alertTitle">Draw!</div>
            <div>The game ended in a draw.</div>
          </div>
        )}
        <div className="boardContainer">
          <div className="boardContent">
            <div className="grid">
              {Array(COLS).fill(null).map((_, colIndex) => (
                <button
                  key={colIndex}
                  className="columnButton"
                  disabled={board[0][colIndex] !== EMPTY || gameOver}
                  onClick={() => handleColumnClick(colIndex)}
                >
                  ↓
                </button>
              ))}
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`} 
                    className={`cell ${isWinningCell(rowIndex, colIndex) ? 'cellWinning' : ''}`}
                  >
                    {cell && <div className={`piece ${cell === PLAYER_1 ? 'player1' : 'player2'}`} />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <button className="resetButton" onClick={resetGame}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
          </svg>
          Reset Game
        </button>
      </div>
    </div>
  );
}

export default ConnectFourApp;

