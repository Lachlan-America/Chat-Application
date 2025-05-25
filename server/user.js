
class User {
    constructor(token, username) {
        this.token = token;
        this.username = username;
    }

    getId() {
        return this.id;
    }
    /**
     * @param {string} username
     */
    setUsername(username) {
        this.username = username;
    }
    getUsername() {
        return this.username;
    }
    getWins() {
        return this.wins;
    }   
    receiveMessage() {
        // TODO: receive message from user
    }
    sendMessage(msg) {
        // TODO: send message to user
    }
    state() {
        return {
            id: this.id,
            username: this.username,
            wins: this.wins,
        };
    }
    setId(id) {
        this.id = id;
    }
}

export default User;