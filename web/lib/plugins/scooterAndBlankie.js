const blankie = require('blankie');
const scooter = require('scooter');

exports.register = (server, options, next) => {
  server.register(scooter, err => {
    if (err) return next(err);
    server.register(
      {
        register: blankie,
        options: {
          childSrc: "'none'",
          connectSrc:
            "'self' https://*.intercom.io wss://*.intercom.io https://api-ping.intercom.io https://*.amazonaws.com https://www.eventbrite.com https://coderdojo.com https://learning-admin.raspberrypi.org https://forums.coderdojo.com",
          defaultSrc: "'none'",
          fontSrc: "'self' http://fonts.gstatic.com https://fonts.gstatic.com",
          frameSrc: 'https://www.google.com https://www.youtube.com',
          frameAncestors: "'none'",
          imgSrc: "'self' 'unsafe-eval' 'unsafe-inline' data: * blob: *",
          manifestSrc: "'none'",
          mediaSrc: "'none'",
          objectSrc: "'none'",
          reflectedXss: 'block',
          scriptSrc:
            "'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com http://www.google-analytics.com https://www.google-analytics.com http://www.googletagmanager.com https://www.googletagmanager.com https://maps.gstatic.com https://www.gstatic.com https://widget.intercom.io https://js.intercomcdn.com https://www.google.com https://apis.google.com http://cdn.optimizely.com/js/3847550948.js http://www.googleadservices.com/pagead/conversion.js ",
          styleSrc:
            "'self' 'unsafe-inline' http://fonts.googleapis.com https://fonts.googleapis.com",
        },
      },
      regErr => {
        if (regErr) return next(regErr);
        next();
      }
    );
  });
};

exports.register.attributes = {
  name: 'scooterAndBlankie',
};
