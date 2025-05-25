import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Connect4 from "./Connect4";
import Home from "./Home";
import Login from "./Login";
import Wordlepage from "./Wordle";
import Profile from "./Profile";
import WordRank from "./wordRank";
import { useState } from "react";

function App() {
  const [socket, setSocket] = useState(null);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login setSocket={setSocket} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/home" element={<Home />} />
        <Route path="/wordle" element={<Wordlepage />} />
        <Route path="/connect4" element={<Connect4 socket={socket} />} />
        <Route path="/wordRank" element={<WordRank />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
