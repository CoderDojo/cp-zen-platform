const service = process.env.USERS_SERVICE;
const Transport = require('../transports/http');

class User {
  constructor() {
    this.transport = new Transport({
      baseUrl: `http://${service}:3000/`,
      json: true,
    });
  }
  search(query) {
    return this.transport.get('users', { qs: query });
  }
  load(userId, query) {
    return this.transport.get(`users/${userId}`, { qs: query });
  }
  delete(userId, { soft }) {
    return this.transport.delete(`users/${userId}`, { body: { soft } });
  }
}

module.exports = new User();
