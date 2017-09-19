const _ = require('lodash');
const Boom = require('boom');

module.exports = function (server) {
  return function (request, reply) {
    const response = request.response;
    let status = _.get(response, 'output.payload.statusCode', undefined);
    let msg = '';
    if (!status) status = _.get(response, 'statusCode', 500);

    if (status >= 400) {
      request.log(['error', status < 500 ? '4xx' : '5xx'], { status, host: server.methods.getUid(), payload: request.payload, params: request.params, url: request.url, user: request.user, error: _.has(response, 'data.details') ? response.data.details : response.output }, Date.now());
      if (response.isBoom) {
        return reply.continue();
      }
      switch (status) {
        case 400:
          msg = _.get(response, 'output.payload.message', undefined);
          return reply(Boom.badRequest(msg));
          break; // eslint-disable-line no-unreachable
        case 401:
        case 403:
        case 410:
          return reply.continue();
          break; // eslint-disable-line no-unreachable
        default:
          return reply(Boom.badImplementation());
      }
    } else {
      return reply.continue();
    }
  };
};
