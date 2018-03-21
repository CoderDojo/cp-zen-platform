const service = process.env.EVENTS_SERVICE;
const Transport = require('../transports/http');

class Application {
  constructor() {
    this.transport = new Transport({
      baseUrl: `http://${service}:3000/`,
      json: true,
    });
  }
  get(query) {
    return this.transport.get('applications', { qs: query });
  }
}
module.exports = new Application();
