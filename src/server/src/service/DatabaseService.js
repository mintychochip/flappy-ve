const sqlite3 = require("sqlite3").verbose();
const { v4: uuidv4 } = require("uuid");

const USER_TABLE = `CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const MATCH_TABLE = `CREATE TABLE IF NOT EXISTS match (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started TIMESTAMP NOT NULL,
  ended TIMESTAMP NOT NULL
);`;

const MATCH_RESULT_TABLE = `CREATE TABLE IF NOT EXISTS match_result (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  FOREIGN KEY (match_id) REFERENCES match (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE 
);`;

const CREATE_USER = "INSERT INTO users (id, name, password) VALUES (?, ?, ?);";
const GET_USER_BY_NAME = "SELECT * FROM users WHERE name = ?";
const GET_USER_BY_ID = "SELECT * FROM users WHERE id = ?";
const GET_ALL_USERS = "SELECT * FROM users";
const DELETE_USER = "DELETE FROM users WHERE name = ?";

// Match table queries
const CREATE_MATCH = "INSERT INTO match (started, ended) VALUES (?, ?);";
const GET_MATCH_BY_ID = "SELECT * FROM match WHERE id = ?";
const GET_ALL_MATCHES = "SELECT * FROM match";
const DELETE_MATCH = "DELETE FROM match WHERE id = ?";

// Match Result table queries
const CREATE_MATCH_RESULT =
  "INSERT INTO match_result (match_id, user_id, score) VALUES (?, ?, ?);";
const GET_MATCH_RESULTS_BY_MATCH_ID =
  "SELECT * FROM match_result WHERE match_id = ?";
const GET_MATCH_RESULTS_BY_USER_ID =
  "SELECT * FROM match_result WHERE user_id = ?";
const DELETE_MATCH_RESULTS = "DELETE FROM match_result WHERE match_id = ?";
const GET_ALL_MATCH_RESULTS = `SELECT mr.id, mr.match_id, mr.user_id, mr.score, u.name
FROM match_result mr
JOIN users u ON mr.user_id = u.id;`;
const GET_MATCH_RESULTS_BY_MATCH_ID_WITH_NAME =
  "SELECT mr.*, u.name FROM match_result mr JOIN users u ON mr.user_id = u.id WHERE mr.match_id = $1";

class DatabaseService {
  constructor(filePath) {
    this.db = new sqlite3.Database(filePath, (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
      } else {
        console.log("Connected to the SQLite database.");
        this.db.run("PRAGMA foreign_keys=ON;");
        this.db.run(USER_TABLE);
        this.db.run(MATCH_TABLE);
        this.db.run(MATCH_RESULT_TABLE);
      }
    });
  }

  // User-related methods
  createUser(name, password) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      this.db.run(CREATE_USER, [id, name, password], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({ id, name });
        }
      });
    });
  }

  getUserByName(name) {
    return new Promise((resolve, reject) => {
      this.db.get(GET_USER_BY_NAME, [name], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  getUserById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(GET_USER_BY_ID, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  getAllUsers() {
    return new Promise((resolve, reject) => {
      this.db.all(GET_ALL_USERS, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  deleteUser(name) {
    return new Promise((resolve, reject) => {
      this.db.run(DELETE_USER, [name], function (err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject("User not found");
        } else {
          resolve("User deleted successfully");
        }
      });
    });
  }

  // Match-related methods
  createMatch(started, ended) {
    return new Promise((resolve, reject) => {
      this.db.run(CREATE_MATCH, [started, ended], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, started, ended });
        }
      });
    });
  }

  getMatchById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(GET_MATCH_BY_ID, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  getAllMatches() {
    return new Promise((resolve, reject) => {
      this.db.all(GET_ALL_MATCHES, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getAllMatchResults() {
    return new Promise((resolve, reject) => {
      this.db.all(GET_ALL_MATCH_RESULTS, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  deleteMatch(id) {
    return new Promise((resolve, reject) => {
      this.db.run(DELETE_MATCH, [id], function (err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject("Match not found");
        } else {
          resolve("Match deleted successfully");
        }
      });
    });
  }

  // Match result-related methods
  createMatchResult(matchId, userId, score) {
    return new Promise((resolve, reject) => {
      this.db.run(
        CREATE_MATCH_RESULT,
        [matchId, userId, score],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, matchId, userId, score });
          }
        }
      );
    });
  }

  getMatchResultsByMatchId(matchId) {
    return new Promise((resolve, reject) => {
      this.db.all(GET_MATCH_RESULTS_BY_MATCH_ID, [matchId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
  getMatchResultsByMatchIdWithName(matchId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        GET_MATCH_RESULTS_BY_MATCH_ID_WITH_NAME,
        [matchId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  getMatchResultsByUserId(userId) {
    return new Promise((resolve, reject) => {
      this.db.all(GET_MATCH_RESULTS_BY_USER_ID, [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  deleteMatchResults(matchId) {
    return new Promise((resolve, reject) => {
      this.db.run(DELETE_MATCH_RESULTS, [matchId], function (err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject("No match results found");
        } else {
          resolve("Match results deleted successfully");
        }
      });
    });
  }

  // Close the database
  close() {
    this.db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
      } else {
        console.log("Database connection closed.");
      }
    });
  }
}

module.exports = DatabaseService;
