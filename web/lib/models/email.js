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
  // eslint-disable-next-line class-methods-use-this
  formatTime(date) {
    return moment.utc(date).format('HH:mm');
  }
  // eslint-disable-next-line class-methods-use-this
  formatDate(date, locale) {
    moment.locale(locale);
    return moment.utc(date).format('Do MMMM YY');
  }
  post(body) {
    return this.transport.post('email/send', { body });
  }
}
module.exports = Email;
