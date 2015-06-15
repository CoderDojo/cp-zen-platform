'use strict';

module.exports = function(options) {
    var seneca = this;
    var plugin = 'cd-events';
    var version = '1.0';


    options = seneca.util.deepextend({
        prefix: '/api/'
    }, options);


    function proxy(args, done) {
        var user = {};

        if (args && args.req$ && args.req$.seneca && args.req$.seneca.login) {
            user = args.req$.seneca.login.user;
        }

        seneca.act(seneca.util.argprops({
                user: user
            },
            args, {
                role: plugin
            }
        ), done);
    }


    seneca.add({
        role: plugin,
        cmd: 'createEvent'
    }, proxy);

    seneca.add({
        role: plugin,
        cmd: 'getEvent'
    }, proxy);

    seneca.add({
        role: plugin,
        cmd: 'listEvents'
    }, proxy);


    seneca.act('role:web', {
        use: {
            prefix: options.prefix + version,
            pin: {
                role: plugin,
                cmd: '*'
            },
            map: {
                'createEvent': {
                    POST: true,
                    alias: 'create-event'
                },
                'getEvent': {
                    GET: true,
                    alias: 'events/:id'
                },
                'listEvents': {
                    GET: true,
                    alias: 'events'
                }

            }
        }
    });


    return {
        name: plugin
    }
};
