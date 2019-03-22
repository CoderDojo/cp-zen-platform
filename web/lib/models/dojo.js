const service = process.env.CLUBS_SERVICE;
const Transport = require('../transports/http');

class Dojo {
  constructor() {
    this.transport = new Transport({
      baseUrl: `http://${service}:3000/`,
      json: true,
    });
  }
  load(id, qs) {
    return this.transport.get(`clubs/${id}`, { qs });
  }
}

module.exports = new Dojo();
