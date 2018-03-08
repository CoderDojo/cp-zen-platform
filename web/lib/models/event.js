const service = process.env.EVENT_SERVICE;
const Transport = require('../transports/http');

class Event {
  constructor() {
    this.transport = new Transport({
      baseUrl: `http://${service}:3000/`,
    });
  }
  get(query) {
    return this.transport.get('events', { params: query });
  }
}
module.exports = new Event();
