const { checkProfiles } = require('cp-permissions-plugin');
const { defaults, omit } = require('lodash');
const Boom = require('boom');

const disallowedParams = [
  'role',
  'zenHostname',
  'locality',
  'user',
  'cmd',
  'login',
  'ok',
];

module.exports = (request, reply) => {
  const permsConfig = request.route.settings.plugins.cpPermissions;
  if (permsConfig && permsConfig.profiles) {
    const msg = Object.assign(
      {
        params: omit(
          defaults({}, request.payload, request.query, request.params),
          disallowedParams
        ),
      },
      request.user
    );
    checkProfiles.call(
      request.seneca,
      permsConfig.profiles,
      msg,
      (err, response) => {
        if (err) {
          // Even if it's a 500, we hide our validator is broken, sshhhh :D
          request.log(
            ['error', '50x'],
            {
              status: '403',
              host: request.app.hostUid,
              payload: request.payload,
              params: request.params,
              url: request.url,
              user: request.user,
              error: err,
            },
            Date.now()
          );
          return reply(Boom.forbidden());
        }
        if (response && response.allowed === true) {
          return reply.continue();
        }
        request.log(
          ['error', '40x'],
          {
            status: '403',
            host: request.app.hostUid,
            payload: request.payload,
            params: request.params,
            url: request.url,
            user: request.user,
            error: response,
          },
          Date.now()
        );
        return reply(Boom.forbidden());
      }
    );
  } else {
    reply.continue();
  }
};
