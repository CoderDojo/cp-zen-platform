
function forumModerators() {
  var moderators = process.env.FORUM_MODS || '';
  return moderators.split(',');
}

module.exports = {
  actcache: {
    active:false
  },

  'main': {
    timeout: 120000,
    strict: {add:false,  result:false}
  },

  webclient: {
    adultforum: process.env.ADULT_FORUM || 'http://localhost:4567',
    youthforum: process.env.YOUTH_FORUM || 'http://localhost:4567',
    forumModerators: forumModerators()
  },

  hapi: {
    connections: {
      routes: {
        security: {
          // Don't allow this site to be displayed in frames.
          xframe: true,
          // Don't allow HTTP requests at all on this subdomain (only HTTPS).
          hsts: {
            maxAge: 15768000,
            includeSubDomains: true,
            preload: true
          },
          // Add a header that helps protect against XSS.
          xss: true,
          // Strictly enforce the response MIME-type.
          noSniff: true
        },
        payload: {
          maxBytes: 5242880
        }
      }
    },
    cache: [
      {
        name: 'cd-cache',
        engine: require('catbox-memory'),
        host: '127.0.0.1',
        partition: 'cache'
      }
    ]
  },

  client: [
    {type: 'web', host: process.env.CD_DOJOS || 'localhost', port: 10301, pin: 'role:cd-dojos,cmd:*'},
    {type: 'web', host: process.env.CD_USERS || 'localhost', port: 10303, pin: 'role:cd-users,cmd:*'},
    {type: 'web', host: process.env.CD_USERS || 'localhost', port: 10303, pin: 'role:cd-agreements,cmd:*'},
    {type: 'web', host: process.env.CD_USERS || 'localhost', port: 10303, pin: 'role:cd-profiles,cmd:*'},
    {type: 'web', host: process.env.CD_USERS || 'localhost', port: 10303, pin: 'role:cd-oauth2,cmd:*'},
    {type: 'web', host: process.env.CD_USERS || 'localhost', port: 10303, pin: 'role:user,cmd:*'},
    {type: 'web', host: process.env.CD_BADGES || 'localhost', port: 10305, pin: 'role:cd-badges,cmd:*'},
    {type: 'web', host: process.env.CD_EVENTS || 'localhost', port: 10306, pin: 'role:cd-events,cmd:*'},
    {type: 'web', host: process.env.CD_EVENTBRITE || 'localhost', port: 10307, pin: 'role:cd-eventbrite, cmd:*'},
    {type: 'web', host: process.env.CD_ORGANISATIONS || 'localhost', port: 10309, pin: 'role:cd-organisations, cmd:*'}
  ],

  timeout: 120000

};
