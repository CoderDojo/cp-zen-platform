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
  load(requestId) {
    return this.transport.get(`/join_requests/${requestId}`);
  }
  delete(requestId, userId) {
    return this.transport.delete(`/users/${userId}/join_requests/${requestId}`);
  }
}

module.exports = new MembershipRequest();
