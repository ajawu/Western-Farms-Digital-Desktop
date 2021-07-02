const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { remote } = require('electron');

const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const loginLoader = document.getElementById('login-loader');
const errorField = document.getElementById('error-text');

/**
 * Saves the user email address as authenticated on successful login
 * @param {string} emailAddress - email address of the user to be saved
 */
function saveAuth(emailAddress) {
  window.localStorage.setItem('auth', emailAddress);
}

/**
 * Confirms that the password saved for that email address matches the password and
 * saves authentication token if it does
 * @param {string} emailAddress email address of the user
 * @param {string} password password of the user to be validated
 * @returns null
 */
function loginUser(emailAddress, password) {
  const db = new sqlite3.Database('../western-data.db');
  db.get(`SELECT password FROM auth WHERE email='${emailAddress}'`, (err, row) => {
    if (err) {
      console.log(err); // Display sql error to the user ?
    } else {
      bcrypt.compare(password, row.password)
        .then((result) => {
          loginButton.classList.add('btn-gray-800');
          loginButton.classList.remove('primary-hover');
          loginLoader.classList.add('d-none');
          if (result) {
            saveAuth(emailAddress);
            remote.getCurrentWindow().loadFile('html&css/pages/dashboard/dashboard.html');
          } else {
            errorField.textContent = 'Username/Password entered is incorrect';
          }
        });
    }
  });
  db.close();
}

// login handler
loginButton.addEventListener('click', (e) => {
  e.preventDefault();
  errorField.textContent = '';
  loginButton.classList.remove('btn-gray-800');
  loginButton.classList.add('primary-hover');
  loginLoader.classList.remove('d-none');
  remote.getCurrentWindow().loadFile('html&css/pages/dashboard/dashboard.html');
  // loginUser(emailField.value, passwordField.value);
});
