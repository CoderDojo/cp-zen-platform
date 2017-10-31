// TODO : concat as index.js for /api
const sys = require('../../api/sys.js');
const configRoute = require('../../api/config.js');
const dojos = require('../../api/dojos.js');
const leads = require('../../api/leads.js');
const users = require('../../api/users.js');
const profiles = require('../../api/profiles.js');
const agreements = require('../../api/agreements.js');
const oauth2 = require('../../api/oauth2.js');
const badges = require('../../api/badges.js');
const events = require('../../api/events.js');
const eventbrite = require('../../api/eventbrite.js');
const polls = require('../../api/polls.js');
const orgs = require('../../api/organisations.js');

exports.register = function (server, options, next) {
  const apis = [sys, { register: configRoute, options: options.webclient },
    dojos, leads, users, profiles, oauth2, agreements,
    badges, events, eventbrite, polls, orgs];
  function errHandler(err) {
    next(err);
  }
  apis.forEach((api) => {
    server.register(api, errHandler);
  });
  next();
};

exports.register.attributes = {
  name: 'cd-apis',
};
