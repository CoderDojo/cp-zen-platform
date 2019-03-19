const service = process.env.USERS_SERVICE;
const Transport = require('../transports/http');

class MembershipRequest {
  constructor() {
    this.transport = new Transport({
      baseUrl: `http://${service}:3000/`,
      json: true,
    });
  }
  create(userId, userType, dojoId) {
    return this.transport.post(`/users/${userId}/join_requests`, {
      body: { userType, dojoId },
    });
  }
}

module.exports = new MembershipRequest();
