const service = process.env.ICS_SERVICE;
const Transport = require('../transports/grpc');
const messages = require('../transports/messages/icsToS3_pb');
const moment = require('moment');

class ICS {
  constructor() {
    this.transport = new Transport(`${service}:50051`);
  }
  dateToArray(date) {
    const formattedDate = moment(date).utc();
    return [formattedDate.year(), formattedDate.month(), formattedDate.date(), formattedDate.hour(), formattedDate.minute()];
  }
  statusToICS(status) {
    let _status;
    switch(status) {
      case 'cancelled':
        _status = 'CANCELLED';
        break;
      case 'draft':
        _status = 'TENTATIVE';
        break;
      default:
        _status = 'CONFIRMED';
    }
    return _status;
  }
  save(event) {
    console.log(
      this.dateToArray(event.dates[0].startTime),
      this.dateToArray(event.dates[0].endTime)
    );
    // TODO : need v3 endpoint to have timezone to generate proper startTime/endTime
    const request = new messages.Event([
      event.name,
      this.dateToArray(event.dates[0].startTime),
      this.dateToArray(event.dates[0].endTime),
      event.description,
      event.address,
      event.position,
      this.statusToICS(event.status),
    ]); 
    this.transport.toS3(request, function (err, response) {
      console.log('res', response.getUrl());
    });
  }
}
module.exports = new ICS();
