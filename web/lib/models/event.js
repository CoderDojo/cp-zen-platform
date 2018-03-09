const service = process.env.EVENT_SERVICE;
const Transport = require('../transports/http');

class Event {
  constructor() {
    this.transport = new Transport({
      baseUrl: `http://${service}:3000/`,
      json: true,
    });
  }
  get(query) {
    return this.transport.get('events', { qs: query });
  }
}
module.exports = new Event();
