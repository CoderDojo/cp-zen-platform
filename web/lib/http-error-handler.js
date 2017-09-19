const _ = require('lodash');
const Boom = require('boom');

module.exports = ({ methods }) => (request, reply) => {
  const response = request.response;
  let status = _.get(response, 'output.payload.statusCode', undefined);
  if (!status) status = _.get(response, 'statusCode', 500);

  if (status >= 400) {
    request.log(
      ['error', status < 500 ? '4xx' : '5xx'],
      {
        status,
        host: methods.getUid(),
        payload: request.payload,
        params: request.params,
        url: request.url,
        user: request.user,
        error: _.has(response, 'data.details') ? response.data.details : response.output,
      },
      Date.now(),
    );
    if (response.isBoom) {
      return reply.continue();
    }
    switch (status) {
      case 400:
        return reply(Boom.badRequest(_.get(response, 'output.payload.message', undefined)));
      case 401:
      case 403:
      case 410:
        return reply.continue();
      default:
        return reply(Boom.badImplementation());
    }
  } else {
    return reply.continue();
  }
};
