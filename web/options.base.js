if (process.env.LOGENTRIES_ENABLED === 'true') var LogEntries = require('le_node');
var assert = require('assert');

var log = function () {
  // seneca custom log handlers

  if (process.env.LOGENTRIES_ENABLED === 'true') {
    assert.ok(process.env.LOGENTRIES_DEBUG_TOKEN, 'No LOGENTRIES_DEBUG_TOKEN set');
    var led = new LogEntries({
      token: process.env.LOGENTRIES_DEBUG_TOKEN,
      flatten: true,
      flattenArrays: true
    });

    assert.ok(process.env.LOGENTRIES_ERRORS_TOKEN, 'No LOGENTRIES_ERROR_TOKEN set');
    var lee = new LogEntries({
      token: process.env.LOGENTRIES_ERRORS_TOKEN,
      flatten: true,
      flattenArrays: true
    });
  }

  function debugHandler() {
    if (process.env.LOGENTRIES_ENABLED === 'true') {
      assert.ok(process.env.LOGENTRIES_DEBUG_TOKEN, 'No LOGENTRIES_DEBUG_TOKEN set');
      led.log('debug', arguments);
    }
  }

  function errorHandler() {
    console.error(JSON.stringify(arguments));

    if (process.env.LOGENTRIES_ENABLED === 'true') {
      assert.ok(process.env.LOGENTRIES_ERRORS_TOKEN, 'No LOGENTRIES_ERROR_TOKEN set');
      lee.log('err', arguments);
    }
  }

  return {
    map:[{
      level:'debug', handler: debugHandler
    }, {
      level:'error', handler: errorHandler
    }]
  };
};

function forumModerators() {
  var moderators = process.env.FORUM_MODS || '';
  return moderators.split(',');
}

module.exports = {
  // purposely commented log: log(),
  actcache: {active:false},
  'main': {
    'timeout': 120000,
    strict: {add:false,  result:false}
  },

  'bodyparser': {
    'json': {
      'limit': '10mb'
    }
  },
  'user-roles': {
    roles: {
      'basic-user': {
        prefixmap: {
          '/dashboard/dojo-list': 1,
          '/dashboard/my-dojos': 1,
          '/dashboard/start-dojo': 1
        }
      },
      'cdf-admin': {
        prefixmap: {
          '/dashboard/dojo-list': 1,
          '/dashboard/my-dojos': 1,
          '/dashboard/start-dojo': 1,
          '/dashboard/manage-dojos': 1,
          '/dashboard/stats': 1
        }
      }
    }
  },

  //All of these routes are restricted.
  //Routes below can be unrestricted by adding them to the relevant user role above
  'web-access': {
    prefixlist: [
      '/dashboard/dojo-list',
      '/dashboard/my-dojos',
      '/dashboard/start-dojo',
      '/dashboard/manage-dojos',
      '/dashboard/stats',
      '/admin'
    ]
  },

  redis: {
    "host": process.env.REDIS_HOST || process.env.DOCKER_HOST_IP || process.env.TARGETIP || '127.0.0.1',
    "port": process.env.REDIS_PORT || 6379 // this is either configurable or in docker locally
  },

  webclient: {
    adultforum: process.env.ADULT_FORUM || 'http://localhost:4567',
    youthforum: process.env.YOUTH_FORUM || 'http://localhost:4567',
    forumModerators: forumModerators()
  }

};
