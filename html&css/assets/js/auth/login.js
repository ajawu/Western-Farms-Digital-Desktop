const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const swal = require('sweetalert');
const { remote } = require('electron');

const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const loginLoader = document.getElementById('login-loader');
const errorField = document.getElementById('error-text');

/**
 * Saves the user email address as authenticated on successful login
 * @param {string} emailAddress - email address of the user to be saved
 * @param {number} userId Id of user on the database
 */
function saveAuth(emailAddress, userId, firstName, lastName) {
  window.localStorage.setItem('auth', JSON.stringify({ email: emailAddress, id: userId, name: `${firstName} ${lastName}` }));
}

function updateLastLogin(userId) {
  const db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });
  try {
    const updateLoginQuery = db.prepare(`UPDATE auth SET last_login = datetime('now') WHERE id = ?`);
    updateLoginQuery.run(userId);
  } catch (err) {
    swal("Oops!", err.message, "error");
  }
}

/**
 * Confirms that the password saved for that email address matches the password and
 * saves authentication token if it does
 * @param {string} emailAddress email address of the user
 * @param {string} password password of the user to be validated
 * @returns null
 */
function loginUser(emailAddress, password) {
  const db = new Database('html&css/assets/js/western-data.db', { verbose: console.log });
  try {
    const emailGetQuery = db.prepare('SELECT password, id, first_name, last_name FROM auth WHERE email= ?');
    const row = emailGetQuery.get(emailAddress);
    bcrypt.compare(password, row.password)
      .then((result) => {
        loginButton.classList.add('btn-gray-800');
        loginButton.classList.remove('primary-hover');
        loginLoader.classList.add('d-none');
        if (result) {
          saveAuth(emailAddress, row.id, row.first_name, row.last_name);
          updateLastLogin(row.id);
          remote.getCurrentWindow().loadFile('html&css/pages/dashboard/dashboard.html');
        } else {
          errorField.textContent = 'Username/Password entered is incorrect';
        }
      });
  } catch (err) {
    swal("Oops!", err.message, "error");
  }
}

// login handler
loginButton.addEventListener('click', (e) => {
  e.preventDefault();
  errorField.textContent = '';
  loginButton.classList.remove('btn-gray-800');
  loginButton.classList.add('primary-hover');
  loginLoader.classList.remove('d-none');
  loginUser(emailField.value, passwordField.value);
});
