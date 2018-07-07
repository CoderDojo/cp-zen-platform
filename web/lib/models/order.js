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
    return this.transport.get('orders', { qs: query });
  }
  post(body) {
    return this.transport.post('orders', { body });
  }
  patch(orderId) {
    return this.transport.patch(`orders/${orderId}/checkin`);
  }
  put(id, body) {
    return this.transport.put(`orders/${id}`, { body });
  }
}
module.exports = new Event();
