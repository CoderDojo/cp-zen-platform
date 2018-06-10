const grpc = require('grpc');
const services = require('./messages/icsToS3_grpc_pb');

module.exports = class Transport {
  constructor(target) {
    return new services.ICSClient(target, grpc.credentials.createInsecure());
  }
};
