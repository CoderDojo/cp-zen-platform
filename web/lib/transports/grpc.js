const grpc = require('grpc');
 
module.exports = class Transport {
  constructor(target, service) {
    return new service(target, grpc.credentials.createInsecure());
  }
};
