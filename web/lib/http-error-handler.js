var _ = require('lodash');
var Boom = require('boom');

module.exports = function (server) {
  return function (request, reply) {
    var response = request.response;
    var status = _.get(response, 'output.payload.statusCode', undefined);
    if (!status) status = _.get(response, 'statusCode', 500);

    if (status >= 400) {
      request.log(['error', status < 500 ? '4xx' : '5xx'], {status: status, host: server.methods.getUid(), payload: request.payload, params: request.params, url: request.url, user: request.user, error: _.has(response, 'data.details')? response.data.details: response.output}, Date.now());
      if (response.isBoom) {
        return reply.continue();
      } else {
        switch (status) {
          case 400:
            var msg = _.get(reponse, 'output.payload.message', undefined);
            return reply(Boom.badRequest(msg));
            break;
          case 401:
          case 403:
            return reply.continue();
            break;
          default:
            return reply(Boom.badImplementation());
        }
      }
    } else {
      return reply.continue();
    }
  }
};
