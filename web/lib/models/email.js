const service = process.env.EMAIL_SERVICE;
const Transport = require('../transports/http');
const moment = require('moment');

class Email {
  constructor() {
    this.transport = new Transport({
      baseUrl: `http://${service}:3000/`,
      json: true,
    });
  }
  formatTime(date) {
    return moment.utc(date).format('HH:mm');
  }
  formatDate(date) {
    return moment.utc(date).format('Do MMMM YY');
  }
  post(body) {
    return this.transport.post('email/send', { body });
  }
}
module.exports = Email; 
