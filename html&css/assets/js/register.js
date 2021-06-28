const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('western-data.db');
const saltRounds = 10;

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
