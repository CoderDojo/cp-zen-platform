
"use strict"

var _ = require('lodash');
var debug = require('debug')('cp-zen-platform:handlers');

module.exports = function(server, role) {

  function doAct (request, reply, cmd, param, user) {
    var zenHostname = request && request.headers.host || '127.0.0.1:8000';
    var msg = {cmd: cmd, role: role, zenHostname: zenHostname, locality: server.methods.locality(request)};
    debug ('handlers.doAct', request.url.path);
    if (request.payload) {
      msg = _.extend(msg, request.payload);
    }
    if (request.query) {
      msg = _.extend(msg, request.query);
    }

    if (param) {
      var paramsMsg = {};
      var params = _.isArray(param) ? param : [param];
      _.each(params, function (p) {
        if (request.params[p]) paramsMsg[p] = request.params[p];
      });
      msg = _.extend(msg, paramsMsg);
    }

    if (user) {
      msg = _.extend(msg, user);
    } else if (request.user) {
      msg = _.extend(msg, request.user);
    }

    debug('handlers.doAct', msg);
    request.seneca.act(msg, function(err, resp) {
      if (err) return reply(err).code(500);

      var code = 200;
      // This is a legacy seneca-web response
      if (resp && resp.http$) {
        if (resp.http$.status) code = resp.http$.status;
        if (resp.http$.redirect) return reply.redirect(resp.http$.redirect);
      }
      reply(resp).code(code);
    });
  }

  var actHandler = function (cmd, param) {
    return function (request, reply) {
      doAct(request, reply, cmd, param);
    };
  }

  var actHandlerNeedsCdfAdmin = function (cmd, param) {
    return actHandlerNeedsUser(cmd, param, {checkCdfAdmin: true});
  }

  var actHandlerNeedsUser = function (cmd, param, opts) {
    return function (request, reply) {
      // Note: request.user is set in onPostAuthHandler
      var user = request.user;
      if (!user) return reply('Not logged in').code(401);

      if (opts && opts.checkCdfAdmin === true) {
        var roles = _.deepHas(user, 'user.user.roles') ? user.user.roles : [];
        if (!_.contains(roles, 'cdf-admin')) {
          // Note: a 200 status code is still returned here (should be 403 by right)
          return reply({ok: false, why: 'You must be a cdf admin to access this data'});
        }
      }

      doAct(request, reply, cmd, param, user);
    };
  }

  return {
    doAct: doAct,
    actHandler: actHandler,
    actHandlerNeedsUser: actHandlerNeedsUser,
    actHandlerNeedsCdfAdmin: actHandlerNeedsCdfAdmin
  };
};