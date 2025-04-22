import Cookies from 'js-cookie';
const COOKIE_USERNAME_KEY = 'username'
export const setUsernameCookie = (username) => {
    Cookies.set(COOKIE_USERNAME_KEY,username,{expires:7});
};
export const getUsernameCookie = (username) => {
   return  Cookies.get(COOKIE_USERNAME_KEY);
};
export const removeUsernameCookie = (username) => {
     Cookies.remove(COOKIE_USERNAME_KEY);
};