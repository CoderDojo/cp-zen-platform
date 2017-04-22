'use strict';

var _ = require('lodash');
_.mixin(require('lodash-deep'));
var debug = require('debug')('cp-zen-platform:handlers');

module.exports = function (server, role) {
  function checkPerms (request, act, callback) {
    //  TODO : return a token instead to ensure that there is no possible bypass of cp-zen
    var base = ['role', 'zenHostname', 'locality', 'user', 'cmd'];
    var msg = _.pick(act, base);
    msg.act = act.cmd;
    msg.params = _.omit(act, _.extend(base, ['user', 'login', 'ok']));
    msg.cmd = 'check_permissions';
    request.seneca.act(msg, callback);
  }

  function doAct (request, reply, cmd, param, user, type, msgDefault) {
    var msg = {cmd: cmd, role: role, locality: server.methods.locality(request)};
    if (msgDefault) _.extend(msg, msgDefault);
    debug('handlers.doAct', request.url.path);
    if (request.payload) {
      msg = _.defaults(msg, request.payload);
    }
    if (request.query) {
      msg = _.defaults(msg, request.query);
    }

    if (param) {
      var paramsMsg = {};
      var params = _.isArray(param) ? param : [param];
      _.each(params, function (p) {
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
    //  TODO: check others calls to request.seneca.act which doesn't go through doAct
    var covered = ['cd-users', 'cd-profiles', 'cd-dojos', 'cd-badges'];
    if (_.includes(covered, msg.role)) {
      checkPerms(request, msg, function (err, response) {
        if (err) {
          // Even if it's a 500, we hide our validator is broken, sshhhh :D
          request.log(['error', '50x'], {status: '403', host: server.methods.getUid(), payload: request.payload, params: request.params, url: request.url, user: request.user, error: response}, Date.now());
          return reply(null).code(403);
        }
        if (response && response.allowed && _.isBoolean(response.allowed)) {
          callAct(request, reply, msg, type);
        } else {
          request.log(['error', '40x'], {status: '403', host: server.methods.getUid(), payload: request.payload, params: request.params, url: request.url, user: request.user, error: response}, Date.now());
          return reply(null).code(403);
        }
      });
    } else {
      callAct(request, reply, msg, type);
    }
  }

  var callAct = function (request, reply, msg, type) {
    request.seneca.act(msg, function (err, resp) {
      if (err) return reply(err).code(500);
      var code = 200;
      // This is a legacy seneca-web response
      if (resp && resp.http$) {
        if (resp.http$.status) code = resp.http$.status;
        if (resp.http$.redirect) return reply.redirect(resp.http$.redirect);
      }
      if (type && ['csv', 'xml'].indexOf(type) > -1) {
        if (type === 'csv') reply(resp.data).header('Content-Type', 'application/csv').header('Content-Disposition');
        if (type === 'xml') reply(resp.data).header('Content-Type', 'application/xml').header('Content-Disposition');
      } else {
        reply(resp).code(code);
      }
    });
  };

  var actHandler = function (cmd, param, type, msgDefault) {
    return function (request, reply) {
      doAct(request, reply, cmd, param, null, type, msgDefault);
    };
  };

  var actHandlerNeedsCdfAdmin = function (cmd, param, msgDefault) {
    return actHandlerNeedsUser(cmd, param, {checkCdfAdmin: true}, msgDefault);
  };

  // If the act is having a specific rule on check_permissions, it needs to use this handler
  var actHandlerNeedsUser = function (cmd, param, opts, msgDefault) {
    return function (request, reply) {
      // Note: request.user is set in onPostAuthHandler
      var user = request.user;
      if (!user) {
        if (!opts || (opts && !opts.soft)) {
          return reply('Not logged in').code(401);
        }
      }

      if (opts && opts.checkCdfAdmin === true) {
        var roles = _.deepHas(user, 'user.roles') ? user.user.roles : [];
        if (!_.contains(roles, 'cdf-admin')) {
          // Note: a 200 status code is still returned here (should be 403 by right)
          return reply({ok: false, why: 'You must be a cdf admin to access this data'});
        }
      }

      if (opts && opts.isOwn === true) {
        var requestedId = request.params[param];
        if (user.user.id !== requestedId) {
          // Note: a 200 status code is still returned here (should be 403 by right)
          return reply({ok: false, why: 'You do not have sufficient permissions to access this feature'});
        }
      }

      doAct(request, reply, cmd, param, user, opts && opts.type ? opts.type : null, msgDefault);
    };
  };

  // Check if the user is a dojo Admin OR a cdfAdmin
  var actHandlerNeedsDojoAdmin = function (cmd, param, type, msgDefault) {
    return function (request, reply) {
      // Note: request.user is set in onPostAuthHandler
      var user = request.user;
      if (!user) return reply('Not logged in').code(401);

      var msg = {
        cmd: 'user_is_dojo_admin',
        role: 'cd-dojos',
        locality: server.methods.locality(request)
      };

      if (request.payload) {
        msg = _.defaults(msg, request.payload);
      }
      if (request.query) {
        msg = _.defaults(msg, request.query);
      }

      if (param) {
        var paramsMsg = {};
        var params = _.isArray(param) ? param : [param];
        _.each(params, function (p) {
          if (request.params[p]) paramsMsg[p] = request.params[p];
        });
        msg = _.defaults(msg, paramsMsg);
      }

      if (user) {
        msg = _.defaults(msg, user);
      } else if (request.user) {
        msg = _.defaults(msg, request.user);
      }

      request.seneca.act(msg, function (err, resp) {
        if (err) return reply(err).code(500);
        var isCDFAdmin = false;
        var code = 200;
        var roles = _.deepHas(user, 'user.roles') ? request.user.user.roles : [];
        if (_.contains(roles, 'cdf-admin')) {
          isCDFAdmin = true;
        }
        if (!resp.userIsDojoAdmin && !isCDFAdmin) {
          code = 401;
          return reply({ok: false, why: 'You must be a dojo admin or ticketing admin to access this data'}).code(code);
        }
        doAct(request, reply, cmd, param, user, type, msgDefault);
      });
    };
  };

  return {
    doAct: doAct,
    actHandler: actHandler,
    actHandlerNeedsUser: actHandlerNeedsUser,
    actHandlerNeedsCdfAdmin: actHandlerNeedsCdfAdmin,
    actHandlerNeedsDojoAdmin: actHandlerNeedsDojoAdmin
  };
};
