const service = process.env.QRCODE_SERVICE;
const { promisify } = require('util');
const Transport = require('../transports/grpc');
const messages = require('../transports/messages/qrcodeToS3_pb');
const definition = require('../transports/messages/qrcodeToS3_grpc_pb');

class QrCode {
  constructor() {
    this.transport = new Transport(`${service}:50051`, definition.QrCoderClient);
  }
  save(orderId, eventId) {
    const req = new messages.Order([orderId, eventId]);
    const toS3 = promisify(this.transport.toS3).bind(this.transport); 
    return toS3(req);
  }
}
module.exports = new QrCode(); 
