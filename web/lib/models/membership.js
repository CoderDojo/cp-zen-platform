const service = process.env.CLUBS_SERVICE;
const Transport = require('../transports/http');

class Membership {
  constructor() {
    this.transport = new Transport({
      baseUrl: `http://${service}:3000/`,
      json: true,
    });
  }
  delete(userId, { soft }) {
    return this.transport.delete(`members/${userId}`, { body: { soft } });
  }
  create(userId, dojoId, userType) {
    return this.transport.post(`clubs/${dojoId}/members`, {
      body: {
        userId,
        userType,
      },
    });
  }
}

module.exports = new Membership();
