import React, { useState, useEffect, useCallback } from 'react';
import WordleApiService from './utilities/WordleApiService';
import { getUsernameCookie } from './utilities/Cookies'

export default function WordleGame({ username }) {
  const [userId, setUserId] = useState(getUsernameCookie() || '');
  const [wordLength, setWordLength] = useState(5);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameActive, setGameActive] = useState(false);
  const [guesses, setGuesses] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [gameStatus, setGameStatus] = useState('setup');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [currentRow, setCurrentRow] = useState(0);
  const [keyboardStatus, setKeyboardStatus] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const maxAttempts = 6;
  const wordLengths = [3, 4, 5, 6, 7, 8];
  const keyboard = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace']
  ];

  useEffect(() => {
    if (username && username.trim()) {
      setUserId(username);
    }
  }, [username]);

  const showMessage = useCallback((text, type) => {
    setMessage({ text, type });
    if (type === 'info' || type === 'success') {
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
    }
  }, []);

  const submitGuess = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await WordleApiService.submitGuess(userId, wordLength, currentGuess);
      if ([0, 10, 30, 40].includes(data.code)) {
        const gameState = data['0'];
        if (gameState && gameState.guesses && gameState.feedbacks) {
          const newGuesses = [...guesses];
          const newFeedback = [...feedback];
          const guessArray = currentGuess.split('');
          newGuesses[currentRow] = guessArray;
          if (gameState.feedbacks[currentRow]) {
            newFeedback[currentRow] = gameState.feedbacks[currentRow];
          }
          setGuesses(newGuesses);
          setFeedback(newFeedback);

          const newKeyboardStatus = { ...keyboardStatus };
          guessArray.forEach((letter, index) => {
            const status = gameState.feedbacks[currentRow][index];
            if (!newKeyboardStatus[letter] || status > newKeyboardStatus[letter]) {
              newKeyboardStatus[letter] = status;
            }
          });
          setKeyboardStatus(newKeyboardStatus);
        }

        if (data.code === 30) {
          showMessage('Congratulations! You won!', 'success');
          setGameActive(false);
          setGameStatus('won');
        } else if (data.code === 40) {
          const wordReveal = gameState?.word || '';
          showMessage(`Game over! The word was: ${wordReveal}`, 'error');
          setGameActive(false);
          setGameStatus('lost');
        } else {
          setCurrentRow(prev => prev + 1);
          setCurrentGuess('');
        }
      } else {
        showMessage(data.message || 'Invalid word or server error', 'error');
      }
    } catch (error) {
      showMessage(`Connection failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [userId, wordLength, currentGuess, currentRow, guesses, feedback, keyboardStatus, showMessage]);

  const handleKeyPress = useCallback((key) => {
    if (!gameActive || isLoading) return;

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
  }, [gameActive, isLoading, currentGuess, wordLength, submitGuess, showMessage]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameActive || isLoading) return;
      if (e.key === 'Enter') handleKeyPress('enter');
      else if (e.key === 'Backspace') handleKeyPress('backspace');
      else if (/^[a-zA-Z]$/.test(e.key)) handleKeyPress(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, gameActive, isLoading]);

  const startGame = async () => {
    
    if (!userId || !userId.trim()) {
      showMessage('Please enter a user ID', 'error');
      return;
    }
    try {
      setIsLoading(true);
      const data = await WordleApiService.startGame(userId, wordLength);
      if (data.code === 0) {
        setGameActive(true);
        setGameStatus('active');
        setCurrentRow(0);
        setCurrentGuess('');
        setGuesses(Array(maxAttempts).fill('').map(() => Array(wordLength).fill('')));
        setFeedback(Array(maxAttempts).fill('').map(() => Array(wordLength).fill(0)));
        setKeyboardStatus({});
        showMessage('Game started! Try to guess the word.', 'info');
      } else {
        showMessage(data.message || 'Error starting game', 'error');
      }
    } catch (error) {
      showMessage(`Connection failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const playAgain = async () => {
    try {
      setIsLoading(true);
      const data = await WordleApiService.playAgain(userId, wordLength);
      if (data.code === 0) {
        setGameActive(true);
        setGameStatus('active');
        setCurrentRow(0);
        setCurrentGuess('');
        setGuesses(Array(maxAttempts).fill('').map(() => Array(wordLength).fill('')));
        setFeedback(Array(maxAttempts).fill('').map(() => Array(wordLength).fill(0)));
        setKeyboardStatus({});
        showMessage('New game started! Try to guess the word.', 'info');
      } else {
        showMessage(data.message || 'Failed to restart game', 'error');
      }
    } catch (error) {
      showMessage(`Connection failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const endGame = async () => {
    try {
      setIsLoading(true);
      const data = await WordleApiService.endGame(userId);
      if (data.code === 0) {
        setGameActive(false);
        setGameStatus('setup');
        showMessage('Game ended. Start a new game when ready.', 'info');
      } else {
        showMessage(data.message || 'Failed to end game', 'error');
      }
    } catch (error) {
      setGameActive(false);
      setGameStatus('setup');
      showMessage('Connection issue, but game ended locally.', 'info');
    } finally {
      setIsLoading(false);
    }
  };

  const getCellStatus = (row, col) => {
    if (feedback[row]?.[col] === 2) return 'bg-green-500 border-green-500 text-white';
    if (feedback[row]?.[col] === 1) return 'bg-yellow-500 border-yellow-500 text-white';
    if (feedback[row]?.[col] === 0 && guesses[row][col]) return 'bg-gray-500 border-gray-500 text-white';
    return 'bg-white border-gray-300';
  };

  const getKeyStatus = (key) => {
    if (['enter', 'backspace'].includes(key)) return 'bg-gray-300 hover:bg-gray-400';
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
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="word-length" className="block text-gray-700 mb-2">Word Length:</label>
            <select 
              id="word-length" 
              value={wordLength}
              onChange={(e) => setWordLength(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={isLoading}
            >
              {wordLengths.map(length => (
                <option key={length} value={length}>{length} letters</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={startGame}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex justify-center items-center ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : 'Start Game'}
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
                      ${getKeyStatus(key)} rounded font-bold text-sm uppercase ${
                        !gameActive || isLoading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    disabled={!gameActive || isLoading}
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
                className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Play Again'}
              </button>
            )}
            
            <button 
              onClick={endGame}
              className={`bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${
                isLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'End Game'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}