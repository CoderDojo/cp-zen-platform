const Email = require('./email');
const i18n = require('../fn/i18n-translate');
const port = process.env.ZEN_PORT || 8000;
const host = process.env.ZEN_HOSTNAME || '127.0.0.1';
const protocol = process.env.ZEN_PROTOCOL || 'http';

class EventEmail extends Email {

  formatEventDate(event) {
    const startTime = this.formatTime(event.startTime);
    const endTime = this.formatTime(event.endTime);
    if (event.type === 'recurring') {
      return `${this.formatDate(event.dates[0].startTime)} - ${this.formatDate(event.dates[dates.length -1].startTime)} ${startTime} - ${endTime}`;
    } else {
      return `${this.formatDate(event.dates[0].startTime)} ${startTime} - ${endTime}`;
    }
  }

  sendAdultBooking(_locale, user, event, order, dojo) {
    const templateName = `ticket-application-${event.ticketApproval? 'received' : 'approved'}`; 
    const locale = _locale || 'en_US';
    const childrenNames = (order.applications.filter((appl) => appl.ticketType === 'ninja')).map((appl) => appl.name);
    const application = order.applications.length > 0 ? order.applications.find((s) => s.ticketType === 'parent-guardian' || s.ticketType === 'mentor') : order.applications[0];
    let intro = '';
    if (order.applications.length > 1) {
      intro = event.ticketApproval ? i18n(locale, { key: 'This is a notification to let you know that a request for a ticket for the below event has been received for your child %1s. Once the request has been approved they will receive their ticket confirmation by email.', count: order.applications.length }) : i18n(locale, { key: 'This is an order confirmation for your child %1s for the below event.', count: order.applications.length });
    } else {
      intro = event.ticketApproval ? 'This is a notification to let you know that your request for a ticket for the below event has been received. Once your request has been approved you will receive your ticket confirmation by email.' : 'This is your order confirmation for the below event.';
    }
    this.post({ 
      language: locale,
      templateName, 
      templateOptions: {
        applicationDate: order.createdAt, 
        sessionName: event.sessions.find((s) => s.id === application.sessionId).name,
        eventDate: this.formatEventDate(event), 
        cancelLinkBase: `${protocol}://${host}:${port}/dashboard/cancel_session_invitation`,
        tickets: order.applications,
        applicantName: application.name,
        applicationId: application.id,
        status: application.status,
        intro,
        event,
        dojo,
        year: new Date().getFullYear(),
      }, 
      emailOptions: { 
        to: `${user.name} <${user.email}>`,
        from: `${dojo.name} <${dojo.email}>`,
      } 
    });
  }
  sendDojoNotifications(_locale, event, order, dojo) {
    const templateName = `ticket-application-${event.ticketApproval? 'received' : 'approved'}-to-dojo`;
    this.post({
      language: locale,
      templateName,
      templateOptions: {
        applicationDate: this.formatDate(order.createdAt),
        sessionName: event.sessions.find((s) => s.id === application.sessionId).name,
        eventDate: `${event.startTime} - ${event.endTime}`,
        applicationLinkBase: `${protocol}://${host}:${port}/dashboard/my-dojos`,
        tickets: order.applications,
        status: order.applications[0].status,
        intro,
        event,
        dojo,
        year: new Date().getFullYear(),
      },
      emailOptions: {
        to: `${dojo.name} <${dojo.email}>`,
        from: 'The CoderDojo Team <info@coderdojo.org>',
      }
    });
  }
}
module.exports = new EventEmail();
