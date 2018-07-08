// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var qrcodeToS3_pb = require('./qrcodeToS3_pb.js');

function serialize_toS3_Order(arg) {
  if (!(arg instanceof qrcodeToS3_pb.Order)) {
    throw new Error('Expected argument of type toS3.Order');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_toS3_Order(buffer_arg) {
  return qrcodeToS3_pb.Order.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_toS3_QrCodeUrl(arg) {
  if (!(arg instanceof qrcodeToS3_pb.QrCodeUrl)) {
    throw new Error('Expected argument of type toS3.QrCodeUrl');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_toS3_QrCodeUrl(buffer_arg) {
  return qrcodeToS3_pb.QrCodeUrl.deserializeBinary(new Uint8Array(buffer_arg));
}


var QrCoderService = exports.QrCoderService = {
  toS3: {
    path: '/toS3.QrCoder/toS3',
    requestStream: false,
    responseStream: false,
    requestType: qrcodeToS3_pb.Order,
    responseType: qrcodeToS3_pb.QrCodeUrl,
    requestSerialize: serialize_toS3_Order,
    requestDeserialize: deserialize_toS3_Order,
    responseSerialize: serialize_toS3_QrCodeUrl,
    responseDeserialize: deserialize_toS3_QrCodeUrl,
  },
};

exports.QrCoderClient = grpc.makeGenericClientConstructor(QrCoderService);
