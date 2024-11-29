const sqlite3 = require("sqlite3").verbose();
const models = require('../Models');
const LOBBY_TABLE = `CREATE TABLE IF NOT EXISTS lobbies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);`;

const HOST_TABLE = `CREATE TABLE IF NOT EXISTS hosts (
  host_id INTEGER NOT NULL,
  lobby_id INTEGER NOT NULL,
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
  FOREIGN KEY (lobby_id) REFERENCES lobbies(id) ON DELETE CASCADE
  )`;
const USER_TABLE = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  lobby_id INTEGER,
  FOREIGN KEY (lobby_id) REFERENCES lobbies(id) ON DELETE SET NULL
);`;
const LOBBY_ADD = "INSERT INTO lobbies (name) VALUES (?);";
const LOBBY_GET_BY_ID = "SELECT name FROM lobbies WHERE id=?;";
const LOBBY_GET_BY_NAME = "SELECT id FROM lobbies WHERE name=?;";
const LOBBY_GET_ALL = "SELECT * FROM lobbies";
const USER_ADD = "INSERT INTO users (name) VALUES (?);";
const USER_REMOVE_BY_NAME = "DELETE FROM users WHERE name=?";
const USER_GET_BY_ID = "SELECT name,lobby_id FROM users WHERE id=?;";
const USER_GET_ALL_BY_LOBBY_ID = "SELECT id,name FROM users WHERE lobby_id=?;";
const USER_GET_ALL = "SELECT * FROM users;";
const USER_EXISTS_BY_NAME = "SELECT EXISTS (SELECT 1 FROM users WHERE name=?);";
const USER_EXISTS_BY_ID = "SELECT EXISTS (SELECT 1 FROM users WHERE id=?);";
const USER_UPDATE_BY_NAME = "UPDATE users SET lobby_id=? WHERE name=?;";
const HOST_ADD = "INSERT INTO hosts(host_id,lobby_id) VALUES (?,?);";
const HOST_REMOVE_BY_HOST = "DELETE FROM hosts WHERE host_id=?";
const HOST_REMOVE_BY_LOBBY = "DELETE FROM hosts WHERE lobby_id=?";
const HOST_GET_BY_LOBBY = "SELECT host_id FROM hosts WHERE lobby_id=?";
const LOBBY_GET_BY_HOST = "SELECT lobby_id FROM hosts WHERE host_id=?";
class LobbyDatabaseService {
  /**
   * Initializes the RoomDatabase with a specified file.
   * @param {string} fileName The SQLite database file name
   */
  constructor(fileName) {
    this.db = new sqlite3.Database(fileName, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Connected to the database.");
      }
    });
    this.db.run(LOBBY_TABLE);
    this.db.run(USER_TABLE);
    this.db.run(HOST_TABLE);
  }
  /**
   * Updates the `lobby_id` for a user based on their name.
   * @param {string} name - The name of the user whose `lobby_id` will be updated.
   * @param {number} lobby_id - The new `lobby_id` to assign to the user.
   * @returns {Promise} A promise that resolves with the update result or rejects with an error.
   */
  updateUserLobbyByName(name, lobby_id) {
    return new Promise((resolve, reject) => {
      this.db.run(USER_UPDATE_BY_NAME, [lobby_id, name], function (err) {
        if (err) {
          reject(err);
          return;
        }
        if (this.changes === 0) {
          reject(new Error("No user found with the specified name"));
          return;
        }
        resolve({ name, lobby_id });
      });
    });
  }

  /**
   * Checks if a user exists in the database by their name.
   * @param {string} name - The name of the user to check.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the user exists.
   * @throws {Error} If the query fails.
   */
  userExistsByName(name) {
    return new Promise((resolve, reject) => {
      this.db.get(USER_EXISTS_BY_NAME, [name], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row.exists === 1); // Returns true if the user exists, false otherwise
      });
    });
  }
  /**
   * Checks if a user exists in the database by their ID.
   * @param {number} id - The ID of the user to check.
   * @returns {Promise<boolean>} A promise that resolves to a boolean indicating whether the user exists.
   * @throws {Error} If the query fails.
   */
  userExistsById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(USER_EXISTS_BY_ID, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row.exists === 1); // Returns true if the user exists, false otherwise
      });
    });
  }
  /**
   * Retrieves the `lobby_id` associated with a specific `host_id`.
   * @param {number} host_id - The ID of the host to get the lobby for.
   * @returns {Promise<Object>} A promise that resolves to an object containing the `lobby_id` associated with the host.
   * @throws {Error} If the host is not found or the query fails.
   */
  getLobbyByHostId(host_id) {
    return new Promise((resolve, reject) => {
      this.db.get(LOBBY_GET_BY_HOST, [host_id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        if (row) {
          resolve(row); // Returns the lobby_id for the host
        } else {
          reject(new Error("Host not found in any lobby"));
        }
      });
    });
  }
  /**
   * Retrieves all users from the database.
   * @returns {Promise<Array<Object>>} A promise that resolves to an array of all users in the database.
   * Each object contains user data (e.g., `id`, `name`, `lobby_id`).
   * @throws {Error} If the query fails.
   */
  getAllUsers() {
    return new Promise((resolve, reject) => {
      this.db.all(USER_GET_ALL, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows); // returns an array of all users
      });
    });
  }
  /**
   * Retrieves all hosts associated with a specific `lobby_id`.
   * @param {number} lobby_id - The ID of the lobby to get hosts for.
   * @returns {Promise<Array<Object>>} A promise that resolves to an array of objects containing the `host_id`s.
   * @throws {Error} If the query fails.
   */
  getHostsByLobbyId(lobby_id) {
    return new Promise((resolve, reject) => {
      this.db.all(HOST_GET_BY_LOBBY, [lobby_id], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows); // Returns an array of host_id(s)
      });
    });
  }
  /**
   * Removes a host from a specific lobby by `lobby_id`.
   * @param {number} lobby_id - The ID of the lobby to remove the host from.
   * @returns {Promise<Object>} A promise that resolves to an object containing the `lobby_id` where the host was removed.
   * @throws {Error} If the deletion fails.
   */
  removeHostByLobbyId(lobby_id) {
    return new Promise((resolve, reject) => {
      this.db.run(HOST_REMOVE_BY_LOBBY, [lobby_id], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ lobby_id }); // Returns the lobby_id where host was removed
      });
    });
  }
  /**
   * Removes a host from the database by `host_id`.
   * @param {number} host_id - The ID of the host to remove.
   * @returns {Promise<Object>} A promise that resolves to an object containing the `host_id` that was removed.
   * @throws {Error} If the deletion fails.
   */
  removeHostByHostId(host_id) {
    return new Promise((resolve, reject) => {
      this.db.run(HOST_REMOVE_BY_HOST, [host_id], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ host_id }); // Returns the host_id that was removed
      });
    });
  }
  /**
   * Adds a host to a lobby by inserting into the `hosts` table.
   * @param {number} host_id - The ID of the host user.
   * @param {number} lobby_id - The ID of the lobby where the host will be added.
   * @returns {Promise<Object>} A promise that resolves to an object containing the `host_id` and `lobby_id`.
   * @throws {Error} If the insertion fails.
   */
  addHost(host_id, lobby_id) {
    return new Promise((resolve, reject) => {
      this.db.run(HOST_ADD, [host_id, lobby_id], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ host_id, lobby_id }); // Returns the host and lobby IDs
      });
    });
  }
  /**
   * Get all users by a specific lobby_id.
   * @param {number} lobby_id The ID of the lobby
   * @returns {Promise} A promise that resolves with the list of users in that lobby or rejects with an error
   */
  getUsersByLobbyId(lobby_id) {
    return new Promise((resolve, reject) => {
      this.db.all(USER_GET_ALL_BY_LOBBY_ID, [lobby_id], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  /**
   * Get user details by user ID.
   * @param {number} id The ID of the user
   * @returns {Promise} A promise that resolves with the user's details or rejects with an error
   */
  getUserById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(USER_GET_BY_ID, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        if (row) {
          resolve(row);
        } else {
          reject(new Error("User not found."));
        }
      });
    });
  }

  /**
   * Remove a user from the database by their name.
   * @param {string} name The name of the user to remove
   * @returns {Promise} A promise that resolves with the deletion confirmation or rejects with an error
   */
  removeUser(name) {
    return new Promise((resolve, reject) => {
      this.db.run(USER_REMOVE_BY_NAME, [name], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ name });
      });
    });
  }

  /**
   * Add a user to the database, associating them with a specific lobby (optional).
   * @param {string} name - The name of the user
   * @returns {Promise} A promise that resolves with the inserted user or rejects with an error
   */
  addUser(name) {
    return new Promise((resolve, reject) => {
      this.db.run(USER_ADD, [name], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID });
      });
    });
  }
  /**
   * Add a new lobby to the database.
   * @param {string} name The name of the lobby
   * @returns {Promise} A promise that resolves with the inserted lobby or rejects with an error
   */
  addLobby(name) {
    return new Promise((resolve, reject) => {
      this.db.run(LOBBY_ADD, [name], function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ name });
      });
    });
  }

  /**
   * Get a lobby by ID.
   * @param {number} id The ID of the lobby
   * @returns {Promise} A promise that resolves with the lobby or rejects with an error
   */
  getLobbyById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(LOBBY_GET_BY_ID, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        if (row) {
          const lobby = new models.Lobby(id, row.name);
          resolve(lobby);
          resolve(row);
        } else {
          reject(new Error("lobby not found."));
        }
      });
    });
  }

  /**
   *
   * @param {string} name
   * @returns
   */
  getLobbyByName(name) {
    return new Promise((resolve, reject) => {
      this.db.get(LOBBY_GET_BY_NAME, [name], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        if (row) {
          const lobby = new models.Lobby(row.id, name);
          resolve(lobby);
          resolve(row);
        } else {
          reject(new Error("lobby not found."));
        }
      });
    });
  }

  /**
   * Get all lobbies from the database.
   * @returns {Promise} A promise that resolves with all lobbies or rejects with an error
   */
  getAllLobbies() {
    return new Promise((resolve, reject) => {
      this.db.all(LOBBY_GET_ALL, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  /**
   * Close the database connection.
   * @returns {Promise} A promise that resolves when the database connection is closed
   */
  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}

class LobbyService {
  /**
   * Initializes the LobbyService with a socket for real-time communication.
   * @param {object} socket The socket object for emitting events.
   */
  constructor(io) {
    this.dbService = new LobbyDatabaseService('database.db');
    this.io = io;
  }

  /**
   * Retrieves all users from the database.
   * @returns {Promise<Array>} A promise that resolves to an array of all users.
   */
  async getAllUsers() {
    try {
      return await this.dbService.getAllUsers();
    } catch (err) {
      console.error("Failed to fetch users:", err);
      throw new Error("Failed to fetch users");
    }
  }

  async getAllLobbies() {
   try {
    return await this.dbService.getAllLobbies();
   } catch (err) {
    console.error(err);
   }
  }
  /**
   * Creates a new user and adds them to the database.
   * @param {string} name The name of the user.
   */
  async createUser(name) {
    try {
      const user = await this.dbService.addUser(name);
      this.io.emit("user-added", user); // Emit the event only on success
    } catch (err) {
      throw err;
    }
  }

  /**
   * Removes a user from the database by name.
   * @param {string} name The name of the user to remove.
   */
  async removeUser(name) {
    try {
      await this.dbService.removeUser(name);
      this.io.emit("user-deleted", name); // Emit event after successful removal
    } catch (err) {
      console.error("Error removing user:", err);
    }
  }

  /**
   * Updates a user's lobby association in the database.
   * @param {string} name The name of the user.
   * @param {number} lobby_id The ID of the lobby to set for the user.
   */
  async setLobby(name, lobby_id) {
    try {
      await this.dbService.updateUserLobbyByName(name, lobby_id);
    } catch (err) {
      console.error(`Error setting lobby for user ${name}:`, err);
    }
  }

  /**
   * Retrieves a user's data by their name.
   * @param {string} name The name of the user to fetch.
   * @returns {Promise<Object|null>} A promise resolving to the user object or null if not found.
   */
  async getUserByName(name) {
    try {
      return await this.dbService.getUserByName(name);
    } catch (err) {
      console.error(`Error fetching user by name ${name}:`, err);
      return null; // Return null on failure
    }
  }

  /**
   * Creates a new lobby, associates a user with it, and adds the user as the host.
   * @param {string} lobby_name The name of the lobby to create.
   * @param {string} user_name The name of the user to associate with the lobby.
   */
  async createLobby(lobby_name, user_name) {
    try {
      await this.dbService.addLobby(lobby_name); // Create the lobby
      const lobby = await this.dbService.getLobbyByName(lobby_name);
      if (!lobby) {
        throw new Error("Failed to retrieve the newly created lobby.");
      }

      const user = await this.getUserByName(user_name);
      if (!user) {
        throw new Error("User does not exist.");
      }

      await this.setLobby(user.name, lobby.id); // Set the user's lobby
      await this.dbService.addHost(user.id, lobby.id); // Add user as host

      this.io.emit("lobby-created", { lobby, user }); // Emit event after success
    } catch (err) {
      console.error("Error creating lobby:", err);
    }
  }

  /**
   * Closes the database connection.
   * @returns {Promise} A promise that resolves when the database connection is closed.
   */
  async close() {
    try {
      await this.dbService.close();
    } catch (err) {
      console.error("Error closing the database connection:", err);
    }
  }
}

module.exports = LobbyService;
