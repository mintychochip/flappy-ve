class Lobby {
    /**
     * 
     * @param {number} id 
     * @param {string} name 
     * @param {number} max_count
     */
    constructor(id, name, max_count = 10) {
        this.id = id;
        this.name = name;
        this.max_count = max_count;
    }
}

class User {
    
    /**
     * 
     * @param {string} socket_id 
     * @param {string} name 
     * @param {number} lobby_id //nullable
     */
    constructor(socket_id, name, lobby_id) {
        this.socket_id = socket_id;
        this.name = name;
        this.lobby_id = lobby_id;
    }
}

class Host {

    /**
     * 
     * @param {string} host_id 
     * @param {number} lobby_id 
     */
    constructor(host_id, lobby_id) {
        this.host_id = host_id;
        this.lobby_id = lobby_id;
    }
}
module.exports = {Lobby, User, Host};