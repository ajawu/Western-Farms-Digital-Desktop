const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const swal = require('sweetalert');
const { remote } = require('electron');
const { app } = require('electron').remote;
const path = require('path');

const databasePath = path.join(app.getAppPath('userData').replace('app.asar', ''), 'western-data.db');

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
function saveAuth(emailAddress, userId, firstName, lastName, isAdmin) {
  window.localStorage.setItem('auth', JSON.stringify({
    email: emailAddress,
    id: userId,
    name: `${firstName} ${lastName}`,
    admin: isAdmin,
  }));
}

function updateLastLogin(userId) {
  const db = new Database(databasePath, { verbose: console.log });
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
  const db = new Database(databasePath, { verbose: console.log });
  try {
    const emailGetQuery = db.prepare('SELECT password, id, first_name, last_name, is_admin FROM auth WHERE email= ?');
    const row = emailGetQuery.get(emailAddress);
    if (bcrypt.compareSync(password, row.password)) {
      saveAuth(emailAddress, row.id, row.first_name, row.last_name, row.is_admin);
      updateLastLogin(row.id);
      if (row.is_admin === 1) {
        remote.getCurrentWindow().loadFile('html&css/pages/dashboard/dashboard.html');
      } else {
        remote.getCurrentWindow().loadFile('html&css/pages/dashboard/new-sale.html');
      }
    } else {
      loginButton.classList.add('btn-gray-800');
      loginButton.classList.remove('primary-hover');
      loginLoader.classList.add('d-none');
      errorField.textContent = 'Username/Password entered is incorrect';
    }
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
