const sqlite3 = require("sqlite3").verbose();
const models = require("../Models");
const { v4: uuidv4 } = require("uuid");

const USER_TABLE = `CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const CREATE_USER = "INSERT INTO users (id, name, password) VALUES (?, ?, ?);";
const GET_USER_BY_NAME = "SELECT * FROM users WHERE name = ?";
const GET_USER_BY_ID = "SELECT * FROM users WHERE id = ?";
const GET_ALL_USERS = "SELECT * FROM users";
const DELETE_USER = "DELETE FROM users WHERE name = ?";

class DatabaseService {
  constructor(filePath) {
    this.db = new sqlite3.Database(filePath, (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
      } else {
        console.log("Connected to the SQLite database.");
        
        this.db.run(USER_TABLE);
      }
    });
  }

  
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
