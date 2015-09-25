'use strict';

module.exports = function () {
  var seneca = this;
  var plugin = 'user';

  seneca.add({role: plugin, cmd: 'encrypt_password'}, proxy);
  seneca.add({role: plugin, cmd: 'verify_password'}, proxy);
  seneca.add({role: plugin, cmd: 'change_password'}, proxy);
  seneca.add({role: plugin, cmd: 'register'}, proxy);
  seneca.add({role: plugin, cmd: 'login'}, proxy);
  seneca.add({role: plugin, cmd: 'confirm'}, proxy);
  seneca.add({role: plugin, cmd: 'auth'}, proxy);
  seneca.add({role: plugin, cmd: 'logout'}, proxy);
  seneca.add({role: plugin, cmd: 'clean'}, proxy);
  seneca.add({role: plugin, cmd: 'create_reset'}, proxy);
  seneca.add({role: plugin, cmd: 'load_reset'}, proxy);
  seneca.add({role: plugin, cmd: 'execute_reset'}, proxy);
  seneca.add({role: plugin, cmd: 'update'}, proxy);
  seneca.add({role: plugin, cmd: 'enable'}, proxy);
  seneca.add({role: plugin, cmd: 'disable'}, proxy);
  seneca.add({role: plugin, cmd: 'delete'}, proxy);

  function proxy (args, done) {
    var user = {};
    if (args.req$) user = args.req$.seneca.login.user;
    seneca.act(seneca.util.argprops(
      {user: user},
      args,
      {role: plugin}
    ), done);
  }

  return {
    name: plugin
  };
};
