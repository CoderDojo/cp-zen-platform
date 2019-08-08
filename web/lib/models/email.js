const service = process.env.EMAIL_SERVICE;
const Transport = require('../transports/http');
const moment = require('moment');
const { cloneDeep } = require('lodash');

class Email {
  constructor(options) {
    this.transport = new Transport({
      baseUrl: `http://${service}:3000/`,
      json: true,
    });
    this.options = options;
    this.defaultAddress = 'info@coderdojo.org';
    this.defaultEmail = `The CoderDojo Team <${this.defaultAddress}>`;
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
  post(payload) {
    const options = cloneDeep(this.options);
    options.headers['x-smtpapi'].category.push(payload.templateName);
    options.headers['x-smtpapi'] = JSON.stringify(options.headers['x-smtpapi']);
    options.replyTo = payload.emailOptions.from;
    const body = {
      ...payload,
      emailOptions: { ...payload.emailOptions, ...options },
    };
    return this.transport.post('email/send', { body });
  }
}
module.exports = Email;
