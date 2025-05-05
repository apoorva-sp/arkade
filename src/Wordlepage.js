import React, { useState, useEffect, useCallback } from 'react';

const API_URL = '/api/wordle.php'; 

export default function WordleGame({username}) {
  // Game state
  const [userId, setUserId] = useState(username || '');
  const [wordLength, setWordLength] = useState(5);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameActive, setGameActive] = useState(false);
  const [guesses, setGuesses] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [gameStatus, setGameStatus] = useState('setup'); // setup, active, won, lost
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentRow, setCurrentRow] = useState(0);
  const [keyboardStatus, setKeyboardStatus] = useState({});
  
  const maxAttempts = 6;
  
  // Available word lengths
  const wordLengths = [3, 4, 5, 6, 7, 8];
  
  // Keyboard layout
  const keyboard = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
  ];
  
  // Handle physical keyboard input
  const handleKeyDown = useCallback((e) => {
    if (!gameActive) return;
    
    if (e.key === 'Enter') {
      handleKeyPress('enter');
    } else if (e.key === 'Backspace') {
      handleKeyPress('backspace');
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      handleKeyPress(e.key.toLowerCase());
    }
  }, [gameActive, currentGuess, wordLength]);
  
  // Add/remove keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Handle virtual keyboard input
  const handleKeyPress = (key) => {
    if (!gameActive) return;
    
    if (key === 'enter') {
      if (currentGuess.length === wordLength) {
        submitGuess();
      } else {
        showMessage(`Word must be ${wordLength} letters long`, 'error');
      }
    } else if (key === 'backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[a-z]$/.test(key) && currentGuess.length < wordLength) {
      setCurrentGuess(prev => prev + key);
    }
  };
  
  // Show message with auto-hide for info messages
  const showMessage = (text, type) => {
    setMessage({ text, type });
    
    if (type === 'info') {
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
    }
  };
  
  // Start a new game
  const startGame = async () => {
    if (!userId.trim()) {
      showMessage('Please enter a user ID', 'error');
      return;
    }
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceID: 1,
          user_id: userId,
          choice: wordLength.toString()
        })
      });
      
      const data = await response.json();
      
      if (data.code === 0) {
        // Game started successfully
        setGameActive(true);
        setGameStatus('active');
        setCurrentRow(0);
        setCurrentGuess('');
        setGuesses(Array(maxAttempts).fill('').map(() => Array(wordLength).fill('')));
        setFeedback(Array(maxAttempts).fill('').map(() => Array(wordLength).fill(0)));
        setKeyboardStatus({});
        
        showMessage('Game started! Try to guess the word.', 'info');
      } else {
        showMessage(`Error: ${data.message}`, 'error');
      }
    } catch (error) {
      showMessage('Failed to connect to the server. Please try again.', 'error');
      console.error('Error:', error);
    }
  };
  
  // Submit the current guess to the server
  const submitGuess = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceID: 2,
          user_id: userId,
          choice: wordLength.toString(),
          guess: currentGuess
        })
      });
      
      const data = await response.json();
      
      if (data.code === 0 || data.code === 30 || data.code === 40 || data.code === 10) {
        // Process the response
        const gameState = data["0"]; // The game state is in a nested object
        
        if (gameState && gameState.guesses && gameState.feedbacks) {
          // Update guesses and feedback
          const newGuesses = [...guesses];
          const newFeedback = [...feedback];
          
          // Convert the current guess to an array of characters
          const guessArray = currentGuess.split('');
          newGuesses[currentRow] = guessArray;
          
          // Get feedback for the current row
          if (gameState.feedbacks[currentRow]) {
            newFeedback[currentRow] = gameState.feedbacks[currentRow];
          }
          
          setGuesses(newGuesses);
          setFeedback(newFeedback);
          
          // Update keyboard status
          const newKeyboardStatus = {...keyboardStatus};
          guessArray.forEach((letter, index) => {
            const status = gameState.feedbacks[currentRow][index];
            // Only update if the new status is "better" than the current one
            // 2 (correct) > 1 (present) > 0 (absent)
            if (!newKeyboardStatus[letter] || status > newKeyboardStatus[letter]) {
              newKeyboardStatus[letter] = status;
            }
          });
          setKeyboardStatus(newKeyboardStatus);
        }
        
        // Check if game is over
        if (data.code === 30) {
          showMessage('Congratulations! You won!', 'success');
          setGameActive(false);
          setGameStatus('won');
        } else if (data.code === 40) {
          const wordReveal = gameState && gameState.word ? gameState.word : '';
          showMessage(`Game over! The word was: ${wordReveal}`, 'error');
          setGameActive(false);
          setGameStatus('lost');
        } else {
          // Prepare for next guess
          setCurrentRow(prev => prev + 1);
          setCurrentGuess('');
        }
      } else {
        showMessage(`Error: ${data.message}`, 'error');
      }
    } catch (error) {
      showMessage('Failed to connect to the server. Please try again.', 'error');
      console.error('Error:', error);
    }
  };
  
  // Play again with the same settings
  const playAgain = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceID: 4,
          user_id: userId,
          choice: wordLength.toString()
        })
      });
      
      const data = await response.json();
      
      if (data.code === 0) {
        // Game restarted successfully
        setGameActive(true);
        setGameStatus('active');
        setCurrentRow(0);
        setCurrentGuess('');
        setGuesses(Array(maxAttempts).fill('').map(() => Array(wordLength).fill('')));
        setFeedback(Array(maxAttempts).fill('').map(() => Array(wordLength).fill(0)));
        setKeyboardStatus({});
        
        showMessage('New game started! Try to guess the word.', 'info');
      } else {
        showMessage(`Error: ${data.message}`, 'error');
      }
    } catch (error) {
      showMessage('Failed to connect to the server. Please try again.', 'error');
      console.error('Error:', error);
    }
  };
  
  // End the current game
  const endGame = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceID: 3,
          user_id: userId
        })
      });
      
      const data = await response.json();
      
      if (data.code === 0) {
        // Game ended successfully
        setGameActive(false);
        setGameStatus('setup');
        
        showMessage('Game ended. Start a new game when ready.', 'info');
      } else {
        showMessage(`Error: ${data.message}`, 'error');
      }
    } catch (error) {
      showMessage('Failed to connect to the server. Please try again.', 'error');
      console.error('Error:', error);
    }
  };
  
  // Get cell status class
  const getCellStatus = (row, col) => {
    if (feedback[row] && feedback[row][col] === 2) return 'bg-green-500 border-green-500 text-white';
    if (feedback[row] && feedback[row][col] === 1) return 'bg-yellow-500 border-yellow-500 text-white';
    if (feedback[row] && feedback[row][col] === 0 && guesses[row][col]) return 'bg-gray-500 border-gray-500 text-white';
    return 'bg-white border-gray-300';
  };
  
  // Get key status class
  const getKeyStatus = (key) => {
    if (key === 'enter' || key === 'backspace') return 'bg-gray-300 hover:bg-gray-400';
    if (keyboardStatus[key] === 2) return 'bg-green-500 text-white';
    if (keyboardStatus[key] === 1) return 'bg-yellow-500 text-white';
    if (keyboardStatus[key] === 0) return 'bg-gray-500 text-white';
    return 'bg-gray-300 hover:bg-gray-400';
  };

  return (
    <div className="flex flex-col items-center p-4 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Custom Wordle Game</h1>
      <p className="text-gray-600 mb-6">Guess the word of your chosen length!</p>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded w-full max-w-md text-center ${
          message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 
          message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {message.text}
        </div>
      )}
      
      {gameStatus === 'setup' && (
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
          <div className="mb-4">
            <label htmlFor="user-id" className="block text-gray-700 mb-2">User ID:</label>
            <input 
              type="text" 
              id="user-id" 
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your user ID" 
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="word-length" className="block text-gray-700 mb-2">Word Length:</label>
            <select 
              id="word-length" 
              value={wordLength}
              onChange={(e) => setWordLength(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
            >
              {wordLengths.map(length => (
                <option key={length} value={length}>{length} letters</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={startGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Start Game
          </button>
        </div>
      )}
      
      {gameStatus !== 'setup' && (
        <div className="bg-white rounded-lg shadow p-6 w-full max-w-md">
          {/* Game Board */}
          <div className="grid gap-2 mb-6">
            {Array(maxAttempts).fill(0).map((_, rowIndex) => (
              <div key={`row-${rowIndex}`} className="flex justify-center gap-2">
                {Array(wordLength).fill(0).map((_, colIndex) => (
                  <div 
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`w-12 h-12 border-2 flex justify-center items-center text-xl font-bold uppercase ${getCellStatus(rowIndex, colIndex)}`}
                  >
                    {rowIndex === currentRow && colIndex < currentGuess.length 
                      ? currentGuess[colIndex]
                      : guesses[rowIndex] && guesses[rowIndex][colIndex] 
                        ? guesses[rowIndex][colIndex] 
                        : ''}
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Keyboard */}
          <div className="mb-6">
            {keyboard.map((row, rowIndex) => (
              <div key={`keyboard-row-${rowIndex}`} className="flex justify-center gap-1 mb-2">
                {row.map(key => (
                  <button
                    key={`key-${key}`}
                    onClick={() => handleKeyPress(key)}
                    className={`${key === 'enter' || key === 'backspace' ? 'px-3 py-4' : 'w-8 h-12'} 
                      ${getKeyStatus(key)} rounded font-bold text-sm uppercase`}
                    disabled={!gameActive}
                  >
                    {key === 'backspace' ? '⌫' : key}
                  </button>
                ))}
              </div>
            ))}
          </div>
          
          {/* Game Controls */}
          <div className="flex justify-center gap-4">
            {(gameStatus === 'won' || gameStatus === 'lost') && (
              <button 
                onClick={playAgain}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Play Again
              </button>
            )}
            
            <button 
              onClick={endGame}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              End Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}