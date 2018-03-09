const _ = require('lodash');

module.exports = server => (request, reply) => {
  //  TODO: separate Boom errors from others
  //  Add instanceId for tracking
  if (_.has(request.response, 'header')) request.response.header('cp-host', server.app.hostUid);
  if (_.has(request.response, 'output')) request.response.output.headers['cp-host'] = server.app.hostUid;

  const status = _.has(request, 'response.output.statusCode')
    ? request.response.output.statusCode
    : 200;

  if (status === 400) {
    request.log(
      ['error', '400'],
      {
        status,
        host: server.app.hostUid,
        payload: request.payload,
        params: request.params,
        url: request.url,
        user: request.user,
        error: _.has(request.response, 'data.details')
          ? request.response.data.details
          : request.response.output,
      },
      Date.now(),
    );
  }
  // if it's an api call, continue as normal..
  if (request.url.path.indexOf('/api/2.0') === 0
      || request.url.path.indexOf('/api/3.0') === 0) {
    return reply.continue();
  }
  // Hapi-auth redirect on failure for cdf portal
  // Others routes are handled by the default redirect of auth-cookie
  // Or should not be handled (403 permissions)
  if (status === 403) {
    if (
      request.route.settings.auth &&
      request.route.settings.auth.access.length > 0 &&
      request.route.settings.auth.access[0].scope.selection.length > 0
    ) {
      const cdfPath =
        request.route.settings.auth.access[0].scope.selection.indexOf('cdf-admin') > -1;
      if (cdfPath) {
        return reply.redirect(`/cdf/login?next=${request.url.path}`);
      }
    }
  }

  if (status !== 404 && status !== 401) {
    return reply.continue();
  }

  request.log(
    ['error', '40x'],
    {
      status,
      host: server.app.hostUid,
      payload: request.payload,
      params: request.params,
      url: request.url,
      user: request.user,
      error: _.has(request.response, 'data.details')
        ? request.response.data.details
        : request.response.output,
    },
    Date.now(),
  );
  return reply.view('index', request.app);
};
