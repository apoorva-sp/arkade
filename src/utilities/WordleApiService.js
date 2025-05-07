/**
 * Simplified Wordle Game API service
 */
 import axios from 'axios';

 // Add a CORS proxy to handle cross-origin requests
 
 const API_URL ='http://arcade.pivotpt.in/wordleAPI.php';
 
 class WordleApiService {
   /**
    * Make a basic API call to the Wordle game server
    * @param {number} serviceID - The service identifier (1=start, 2=guess, 3=end, 4=playAgain)
    * @param {number} userId - The user identifier
    * @param {Object} params - Additional parameters for the API call
    * @returns {Promise} - Promise resolving to API response data
    */
   static async callAPI(serviceID, userId, params = {}) {
     try {
       // Prepare request payload by combining serviceID, userId and additional params
       const payload = {
         serviceID,
         user_id: userId,
         ...params
       };
       
       // Add any API authentication if available (replace with actual values)
       const headers = {
         'Content-Type': 'application/json',
         'Referer': 'http://arcade.pivotpt.in/',
         'Origin': 'http://arcade.pivotpt.in'
       };
       
       const response = await axios.post(API_URL, payload, { headers });
       
       return response.data;
     } catch (error) {
       console.error('API call failed:', error);
       if (error.response) {
         console.error('Response data:', error.response.data);
         console.error('Response status:', error.response.status);
         console.error('Response headers:', error.response.headers);
       }
       throw error; // Re-throw so callers can handle the error
     }
   }
 
   /**
    * Start a new game
    * @param {number} userId - The user identifier
    * @param {number} wordLength - Length of the word to guess
    * @returns {Promise} - Promise resolving to game initialization data
    */
   static startGame(userId, wordLength) {
     return this.callAPI(1, userId, { choice: wordLength.toString() });
   }
 
   /**
    * Submit a guess
    * @param {number} userId - The user identifier
    * @param {number} wordLength - Length of the word being guessed
    * @param {string} guess - The word guess
    * @returns {Promise} - Promise resolving to guess evaluation data
    */
   static submitGuess(userId, wordLength, guess) {
     return this.callAPI(2, userId, { 
       choice: wordLength.toString(), 
       guess 
     });
   }
 
   /**
    * End the current game
    * @param {number} userId - The user identifier
    * @returns {Promise} - Promise resolving to game end data
    */
   static endGame(userId) {
     return this.callAPI(3, userId);
   }
 
   /**
    * Start a new game with the same settings
    * @param {number} userId - The user identifier
    * @param {number} wordLength - Length of the word to guess
    * @returns {Promise} - Promise resolving to new game data
    */
   static playAgain(userId, wordLength) {
     return this.callAPI(4, userId, { choice: wordLength.toString() });
   }
 }
 
 export default WordleApiService;