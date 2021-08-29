const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const validator = require('email-validator');
const { remote } = require('electron');

const saltRounds = 10;
const emailField = document.getElementById('email');
const passwordOneField = document.getElementById('password');
const passwordTwoField = document.getElementById('confirm_password');
const errorField = document.getElementById('error-text');
const registerButton = document.getElementById('register-button');

/**
 * Inserts the given email address and the password hash into the auth table
 * @param {string} email email address of the user to be entered into the database
 * @param {string} passwordHash bcrypt hash of the password text
 * @returns null
 */
function insertUserData(email, passwordHash) {
    const today = new Date();
    let month = today.getMonth() + 1;
    if (month < 10) month = `0${month}`;
    const db = new sqlite3.Database('../western-data.db');
    db.run(
        "INSERT INTO auth('email', 'password', 'date_joined') VALUES(?, ?, ?)",
        [
            email,
            passwordHash,
            `${today.getFullYear()}/${month}/${today.getDate()}`,
        ],
        (err) => {
            if (err) console.log(err);
        },
    );
    window.localStorage.setItem('auth', email); // save email address for authentication
    remote
        .getCurrentWindow()
        .loadFile('html&css/pages/dashboard/dashboard.html');
    db.close();
}

/**
 * Register a new user with the credentials enterered into the register form
 */
function registerUser() {
    if (validator.validate(emailField.value)) {
        if (passwordOneField.value === passwordTwoField.value) {
            bcrypt.hash('password', saltRounds).then((hash) => {
                insertUserData(emailField.value, hash);
            });
        } else {
            errorField.textContent = 'Passwords entered do not match';
        }
    } else {
        errorField.textContent = 'Email address entered is invalid';
    }
}

registerButton.addEventListener('click', (e) => {
    e.preventDefault();
    registerUser();
});
