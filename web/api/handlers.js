

const _ = require('lodash');
_.mixin(require('lodash-deep'));
const debug = require('debug')('cp-zen-platform:handlers');
const Boom = require('boom');

module.exports = function (server, role) {
  function checkPerms(request, act, callback) {
    //  TODO : return a token instead to ensure that there is no possible bypass of cp-zen
    const base = ['role', 'zenHostname', 'locality', 'user', 'cmd'];
    const msg = _.pick(act, base);
    msg.act = act.cmd;
    msg.params = _.omit(act, _.extend(base, ['user', 'login', 'ok']));
    msg.cmd = 'check_permissions';
    request.seneca.act(msg, callback);
  }

  function callAct(request, reply, msg, type) {
    request.seneca.act(msg, (err, resp) => {
      if (err) return reply(Boom.badImplementation(err));
      let code = 200;
      // This is a legacy seneca-web response
      if (resp && resp.http$) {
        if (resp.http$.status) code = resp.http$.status;
        if (resp.http$.redirect) return reply.redirect(resp.http$.redirect);
      }
      if (type && ['csv', 'xml'].indexOf(type) > -1) {
        if (type === 'csv') return reply(resp.data).header('Content-Type', 'application/csv').header('Content-Disposition');
        if (type === 'xml') return reply(resp.data).header('Content-Type', 'application/xml').header('Content-Disposition');
      } else {
        return reply(resp).code(code);
      }
    });
  }

  function doAct(request, reply, cmd, param, user, type, msgDefault) {
    let msg = { cmd, role, locality: server.methods.locality(request) };
    //  TODO: check others calls to request.seneca.act which doesn't go through doAct
    const covered = ['cd-users', 'cd-profiles', 'cd-dojos', 'cd-badges',
      'cd-events', 'cd-eventbrite', 'cp-organisations'];

    if (msgDefault) _.extend(msg, msgDefault);
    debug('handlers.doAct', request.url.path);
    if (request.payload) {
      msg = _.defaults(msg, request.payload);
    }
    if (request.query) {
      msg = _.defaults(msg, request.query);
    }

    if (param) {
      const paramsMsg = {};
      const params = _.isArray(param) ? param : [param];
      _.each(params, (p) => {
        if (request.params[p]) paramsMsg[p] = request.params[p];
      });
      msg = _.defaults(msg, paramsMsg);
    }

    if (user) {
      msg = _.defaults(msg, user);
    } else if (request.user) {
      msg = _.defaults(msg, request.user);
    }

    debug('handlers.doAct', msg);
    if (_.includes(covered, msg.role)) {
      return checkPerms(request, msg, (err, response) => {
        if (err) {
          // Even if it's a 500, we hide our validator is broken, sshhhh :D
          request.log(['error', '50x'], { status: '403', host: server.app.hostUid, payload: request.payload, params: request.params, url: request.url, user: request.user, error: err }, Date.now());
          return reply(Boom.forbidden());
        }
        if (response && response.allowed && _.isBoolean(response.allowed)) {
          return callAct(request, reply, msg, type);
        }
        request.log(['error', '40x'], { status: '403', host: server.app.hostUid, payload: request.payload, params: request.params, url: request.url, user: request.user, error: response }, Date.now());
        return reply(Boom.forbidden());
      });
    }
    return callAct(request, reply, msg, type);
  }

  function actHandler(cmd, param, type, msgDefault) {
    return function (request, reply) {
      doAct(request, reply, cmd, param, null, type, msgDefault);
    };
  }

  // If the act is having a specific rule on check_permissions, it needs to use this handler
  function actHandlerNeedsUser(cmd, param, opts, msgDefault) {
    return function (request, reply) {
      // Note: request.user is set in onPostAuthHandler
      const user = request.user;
      if (!user) {
        if (!opts || (opts && !opts.soft)) {
          return reply(Boom.unauthorized('Not logged in'));
        }
      }

      if (opts && opts.checkCdfAdmin === true) {
        const roles = _.deepHas(user, 'user.roles') ? user.user.roles : [];
        if (!_.contains(roles, 'cdf-admin')) {
          // Note: a 200 status code is still returned here (should be 403 by right)
          return reply({ ok: false, why: 'You must be a cdf admin to access this data' });
        }
      }

      if (opts && opts.isOwn === true) {
        const requestedId = request.params[param];
        if (user.user.id !== requestedId) {
          // Note: a 200 status code is still returned here (should be 403 by right)
          return reply({ ok: false, why: 'You do not have sufficient permissions to access this feature' });
        }
      }

      return doAct(request, reply, cmd, param, user,
        opts && opts.type ? opts.type : null, msgDefault);
    };
  }

  function actHandlerNeedsCdfAdmin(cmd, param, msgDefault) {
    return actHandlerNeedsUser(cmd, param, { checkCdfAdmin: true }, msgDefault);
  }

  // Check if the user is a dojo Admin OR a cdfAdmin
  function actHandlerNeedsDojoAdmin(cmd, param, type, msgDefault) {
    return function (request, reply) {
      // Note: request.user is set in onPostAuthHandler
      const user = request.user;
      if (!user) return reply(Boom.unauthorized('Not logged in'));

      let msg = {
        cmd: 'user_is_dojo_admin',
        role: 'cd-dojos',
        locality: server.methods.locality(request),
      };

      if (request.payload) {
        msg = _.defaults(msg, request.payload);
      }
      if (request.query) {
        msg = _.defaults(msg, request.query);
      }

      if (param) {
        const paramsMsg = {};
        const params = _.isArray(param) ? param : [param];
        _.each(params, (p) => {
          if (request.params[p]) paramsMsg[p] = request.params[p];
        });
        msg = _.defaults(msg, paramsMsg);
      }

      if (user) {
        msg = _.defaults(msg, user);
      } else if (request.user) {
        msg = _.defaults(msg, request.user);
      }

      request.seneca.act(msg, (err, resp) => {
        if (err) return reply(Boom.badImplementation());
        let isCDFAdmin = false;
        let code = 200;
        const roles = _.deepHas(user, 'user.roles') ? request.user.user.roles : [];
        if (_.contains(roles, 'cdf-admin')) {
          isCDFAdmin = true;
        }
        if (!resp.userIsDojoAdmin && !isCDFAdmin) {
          code = 401;
          return reply({ ok: false, why: 'You must be a dojo admin or ticketing admin to access this data' }).code(code);
        }
        return doAct(request, reply, cmd, param, user, type, msgDefault);
      });
    };
  }

  return {
    doAct,
    actHandler,
    actHandlerNeedsUser,
    actHandlerNeedsCdfAdmin,
    actHandlerNeedsDojoAdmin,
  };
};
