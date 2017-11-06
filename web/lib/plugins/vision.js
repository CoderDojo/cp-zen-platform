const vision = require('vision');
const dust = require('hapi-dust');
const path = require('path');

exports.register = (server, options, next) => {
  server.register(vision, (err) => {
    if (err) throw err;
    // root: https://github.com/hapijs/vision/issues/94
    server.root.views({
      engines: { dust },
      path: [
        path.join(__dirname, './../../public/templates'),
        path.join(__dirname, './../../public/js/'),
      ],
      partialsPath: path.join(__dirname, './../../public/templates'),
      compileMode: 'async',
    });
    next();
  });
};

exports.register.attributes = {
  name: 'cd-vision',
};
