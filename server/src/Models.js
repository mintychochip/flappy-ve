class Lobby {
    /**
     * 
     * @param {number} id 
     * @param {string} name 
     */
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}

class User {
    
    /**
     * 
     * @param {number} id 
     * @param {string} name 
     * @param {number} lobby_id 
     */
    constructor(id, name, lobby_id) {
        this.id = id;
        this.name = name;
        this.lobby_id = lobby_id;
    }
}

class Host {

    /**
     * 
     * @param {number} host_id 
     * @param {number} lobby_id 
     */
    constructor(host_id, lobby_id) {
        this.host_id = host_id;
        this.lobby_id = lobby_id;
    }
}
module.exports = {Lobby, User, Host};