const { eachSeries } = require('async');
const { partialRight } = require('lodash');
const Boom = require('boom');

const stepHandler = (step, cb, req, reply) => step(req, reply, cb);

const errorHandler = (err, reply) => {
  if (err) return reply(Boom.boomify(err));
};
// Note : to be investigated : 
//  - generic json handler with callback being able to bypass a part of the cb chain 
//        to reach the finalHandler
//    - avoid to call reply
//    - ensure reply is called once and only once
//  - pass req.user in a generic manner
module.exports = (cbs, formatter) => {
  let finalCb = errorHandler;
  if (formatter) finalCb = formatter;
  return (req, reply) =>
    eachSeries(
      cbs,
      partialRight(stepHandler, req, reply),
      partialRight(finalCb, reply),
    );
};
