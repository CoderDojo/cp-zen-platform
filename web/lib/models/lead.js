const service = process.env.CLUBS_SERVICE;
const Transport = require('../transports/http');

class Lead {
  constructor() {
    this.transport = new Transport({
      baseUrl: `http://${service}:3000/`,
      json: true,
    });
  }
  list(query) {
    return this.transport.get(`leads`, { qs: query });
  }
}

module.exports = new Lead();
