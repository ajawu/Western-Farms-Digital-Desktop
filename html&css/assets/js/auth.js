const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('western-data.db');

/**
 * Register a new user
 */
function registerUser() {
  db.serialize(() => {
    const stmt = db.prepare("INSERT INTO auth (email, first_name, last_name, is_admin, password) VALUES('ajawudavid@gmail.com', 'David', 'Ajawu', '1', 'password')");
    stmt.run();
    stmt.finalize();
  });
}

/**
 * Authenticate user with given email address and password
 * @param {string} emailAddress: email address of the user
 * @param {string} password: password of the user
 */
function loginUser(emailAddress, password) {
  db.serialize(() => {
    const statement = db.prepare(`SELECT *  FROM auth WHERE email=${emailAddress} AND password=${password}`);
    const user = statement.run();
    if (user) {
      console.log('User authenticated successfully');
    }
  });
}

document.getElementById('login-button').addEventListener('click', (e) => {
  e.preventDefault();
  loginUser('ajawudavid@gmail.com', 'password');
});

db.close();

const usernameField = document.getElementById('email');

document.getElementById('login-button').addEventListener('click', (e) => {
  e.preventDefault();
  usernameField.value = 'Hello Clicked';
});
