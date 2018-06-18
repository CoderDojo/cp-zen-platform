const service = process.env.EVENTS_SERVICE;
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
  load(id, query) {
    return this.transport.get(`events/${id}`, { qs: query });
  }
}
module.exports = new Event();
