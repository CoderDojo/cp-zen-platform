// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var icsToS3_pb = require('./icsToS3_pb.js');

function serialize_toS3_Event(arg) {
  if (!(arg instanceof icsToS3_pb.Event)) {
    throw new Error('Expected argument of type toS3.Event');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_toS3_Event(buffer_arg) {
  return icsToS3_pb.Event.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_toS3_IcsUrl(arg) {
  if (!(arg instanceof icsToS3_pb.IcsUrl)) {
    throw new Error('Expected argument of type toS3.IcsUrl');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_toS3_IcsUrl(buffer_arg) {
  return icsToS3_pb.IcsUrl.deserializeBinary(new Uint8Array(buffer_arg));
}


var ICSService = exports.ICSService = {
  toS3: {
    path: '/toS3.ICS/toS3',
    requestStream: false,
    responseStream: false,
    requestType: icsToS3_pb.Event,
    responseType: icsToS3_pb.IcsUrl,
    requestSerialize: serialize_toS3_Event,
    requestDeserialize: deserialize_toS3_Event,
    responseSerialize: serialize_toS3_IcsUrl,
    responseDeserialize: deserialize_toS3_IcsUrl,
  },
};

exports.ICSClient = grpc.makeGenericClientConstructor(ICSService);
