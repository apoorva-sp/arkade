import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "./styles/connect4.css";

const ConnectFourGame = ({ socket }) => {
  const navigate = useNavigate();
  const username = Cookies.get("username");
  const url = "https://arcade.pivotpt.in/connectFourAPI.php";

  const [roomCode, setRoomCode] = useState("");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [gamePlaying, setGamePlaying] = useState(false);
  const [board, setBoard] = useState(
    Array.from({ length: 6 }, () => Array(7).fill(0))
  );
  const [isFilled, setIsFilled] = useState(Array(7).fill(0));
  const [gameVisible, setGameVisible] = useState(false);

  // === Game Logic ===
  const hostGame = async () => {
    const body = { serviceID: 1, username };
    const res = await axios.post(url, body);
    if (res.data.code === 0) {
      const game = res.data.game_state;
      setRoomCode(res.data.room_code);
      socket.emit("join_room", res.data.room_code);
      setPlayer1(game.player1);
      setPlayer2(game.player2);
      setCurrentPlayer(game.currentPlayer);
      setGameVisible(true);
      setGamePlaying(false);
    } else {
      alert(res.data.message);
    }
  };

  const joinGame = async () => {
    const code = prompt("Enter Room Code:");
    if (!code) return;

    const body = { serviceID: 2, username, room_code: code };
    const res = await axios.post(url, body);
    if (res.data.code === 0) {
      const game = res.data.game_state;
      setRoomCode(res.data.room_code);
      socket.emit("join_room", res.data.room_code);
      setPlayer1(game.player1);
      setPlayer2(game.player2);
      setCurrentPlayer(game.currentPlayer);
      setGameVisible(true);
      setGamePlaying(true);
    } else {
      alert(res.data.message);
    }
  };

  const playGame = async (column) => {
    const body = {
      serviceID: 3,
      username,
      room_code: roomCode,
      column,
    };
    const res = await axios.post(url, body);
    if (![0, 80, 81].includes(res.data.code)) {
      alert(res.data.message);
    }
  };

  const leaveGame = useCallback(
    async (proper = false) => {
      const body = {
        serviceID: proper ? 5 : 4,
        username,
        room_code: roomCode,
      };
      const res = await axios.post(url, body);
      if (res.data.code === 0) {
        socket.emit("leave_room", roomCode);
        setGameVisible(false);
        navigate("/home");
      } else {
        alert(res.data.message);
      }
    },
    [username, roomCode, socket, navigate]
  );

  // === Socket Handlers ===
  const onJoinedRoom = useCallback(
    (args) => {
      if (args && typeof args === "string") {
        try {
          const data = JSON.parse(args);
          console.log(data.name + " joined room");

          const player = data.name;
          if (player !== username) {
            setPlayer2(player);
            setGamePlaying(true);
          }
        } catch (err) {
          console.error("Failed to parse joined_room data:", err);
        }
      }
    },
    [username]
  );

  const onGamePlayed = useCallback((data) => {
    const gameState = data.game_state;
    setCurrentPlayer(gameState.currentPlayer);
    setBoard(gameState.board);
    setIsFilled(gameState.isFilled);
  }, []);

  const onGameWon = useCallback(
    (data) => {
      const gameState = data.game_state;
      setBoard(gameState.board);
      const winner = gameState.winner;
      setTimeout(() => {
        alert(winner === username ? "You Won :D" : "You Lost :(");
        navigate("/home");
        leaveGame(true);
      }, 100);
    },
    [username, navigate, leaveGame]
  );

  const onGameDraw = useCallback(() => {
    alert("Game Drawn");
    navigate("/home");
  }, [navigate]);

  const onPlayerLeft = useCallback(
    (data) => {
      if (!data || !data.username) return;

      if (data.username !== username) {
        alert("Opponent left. You won!");
        navigate("/home");
      }
    },
    [username, navigate]
  );

  // === Socket Registration ===
  useEffect(() => {
    if (!socket) return;

    socket.on("joined_room", onJoinedRoom);
    socket.on("game_played", onGamePlayed);
    socket.on("game_won", onGameWon);
    socket.on("game_draw", onGameDraw);
    socket.on("player_left", onPlayerLeft);

    return () => {
      socket.off("joined_room", onJoinedRoom);
      socket.off("game_played", onGamePlayed);
      socket.off("game_won", onGameWon);
      socket.off("game_draw", onGameDraw);
      socket.off("player_left", onPlayerLeft);
    };
  }, [socket, onJoinedRoom, onGamePlayed, onGameWon, onGameDraw, onPlayerLeft]);

  return (
    <div className="container" style={{ padding: "1rem" }}>
      {!gameVisible ? (
        <>
          <button
            onClick={hostGame}
            className="column-button"
            style={{ width: 120, marginBottom: 10 }}
          >
            Host Game
          </button>
          <button
            onClick={joinGame}
            className="column-button"
            style={{ width: 120 }}
          >
            Join Game
          </button>
        </>
      ) : (
        <>
          <div className="status-container">
            <h3>Room Code: {roomCode}</h3>
            <p>Player 1: {player1}</p>
            <p>Player 2: {player2}</p>
            <div className="current-player">
              <span>Current Player:{currentPlayer}</span>
            </div>
          </div>

          <div className="board-container">
            <div className="board-content">
              <div className="grid">
                {/* Column buttons */}
                {Array(7)
                  .fill(0)
                  .map((_, idx) => (
                    <button
                      key={idx}
                      disabled={isFilled[idx] === 1 || !gamePlaying}
                      onClick={() => playGame(idx)}
                      className="column-button"
                    >
                      ↓
                    </button>
                  ))}

                {/* Board cells */}
                {board.map((row, rowIdx) =>
                  row.map((cell, colIdx) => (
                    <div key={`${rowIdx}-${colIdx}`} className="cell">
                      {cell !== 0 && (
                        <div
                          className="piece"
                          style={{
                            backgroundColor: cell === 1 ? "red" : "yellow",
                          }}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => leaveGame()}
            className="reset-button"
            style={{ marginTop: 16 }}
          >
            Leave Game
          </button>
        </>
      )}
    </div>
  );
};

export default ConnectFourGame;
