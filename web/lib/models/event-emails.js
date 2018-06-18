const moment = require('moment');
const Email = require('./email');
const i18n = require('../fn/i18n-translate');

const port = process.env.ZEN_PORT || 8000;
const host = process.env.ZEN_HOSTNAME || 'localhost';
const protocol = process.env.ZEN_PROTOCOL || 'http';

class EventEmail extends Email {
  formatEventDate(event, locale) {
    if (event.type === 'recurring') {
      const recurrences = {
        biweekly: 'Every two weeks',
        weekly: 'Weekly',
      };
      moment.locale(locale);
      const dayName = moment(event.dates[0].startTime).utc().format('dddd');
      const recurrence = recurrences[event.recurringType];
      return `${i18n(locale, { key: recurrence })} ${i18n(locale, { key: 'on' })} ${dayName}`;
    }
    return `${this.formatDate(event.dates[0].startTime, locale)}`;
  }
  formatEventTime(event) {
    const startTime = this.formatTime(event.startTime);
    const endTime = this.formatTime(event.endTime);
    return `${startTime} - ${endTime}`;
  }

  sendAdultBooking(locale, user, event, order, dojo) {
    const templateName = 'booking-confirmed';
    this.post({
      language: locale,
      templateName,
      templateOptions: {
        applicationDate: order.createdAt,
        eventDate: this.formatEventDate(event, locale),
        eventTime: this.formatEventTime(event),
        applications: order.applications,
        event,
        dojo,
        year: new Date().getFullYear(),
      },
      emailOptions: {
        to: `${user.name} <${user.email}>`,
        from: `${dojo.name} <${dojo.email}>`,
      },
    });
  }
  sendDojoNotification(locale, event, order, dojo) {
    const templateName = `ticket-application-${event.ticketApproval ? 'received' : 'approved'}-to-dojo`;
    const application = order.applications.length > 1 ? order.applications.find(s => s.ticketType === 'parent-guardian' || s.ticketType === 'mentor') : order.applications[0];
    this.post({
      language: locale,
      templateName,
      templateOptions: {
        applicationDate: this.formatDate(order.createdAt, locale),
        sessionName: event.sessions.find(s => s.id === application.sessionId).name,
        dojoName: dojo.name,
        dojoId: dojo.id,
        eventId: event.id,
        eventDate: this.formatEventDate(event, locale),
        applicationsLinkBase: `${protocol}://${host}:${port}/dashboard/my-dojos`,
        tickets: Object.values(order.applications.reduce((acc, appl) => {
          acc[appl.ticketId] = acc[appl.ticketId] ? acc[appl.ticketId] : {
            quantity: 0,
            ticketType: appl.ticketType,
            ticketName: appl.ticketName,
          };
          acc[appl.ticketId].quantity += 1;
          return acc;
        }, {})),
        status: order.applications[0].status,
        event,
        dojo,
        year: new Date().getFullYear(),
      },
      emailOptions: {
        to: `${dojo.name} <${dojo.email}>`,
        from: 'The CoderDojo Team <info@coderdojo.org>',
      },
    });
  }
}
module.exports = new EventEmail();
