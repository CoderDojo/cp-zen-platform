const service = process.env.EVENTS_SERVICE;
const Transport = require('../transports/http');

// Note : Order is a better superset
// but we need it for backward compat (deletion of account)
class Application {
  constructor() {
    this.transport = new Transport({
      baseUrl: `http://${service}:3000/`,
      json: true,
    });
  }
  get forUser() {
    const self = this;
    return {
      delete(id, body) {
        return self.transport.delete(`users/${id}/applications`, { body });
      },
    };
  }
}
module.exports = new Application();
