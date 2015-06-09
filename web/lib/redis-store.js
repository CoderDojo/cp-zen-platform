var session = require('express-session')
var RedisStore = require('connect-redis')(session)

module.exports = function redis(settings, redisConfig){
    settings.store = new RedisStore(redisConfig)
    return session(settings)

}