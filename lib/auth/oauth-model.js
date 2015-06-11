/**
 * Copyright 2013-present NightWorld.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var pg = require('pg'),
    model = module.exports,
    connString = 'postgres://platform:QdYx3D5y@192.168.59.103/oauth'

/*
 * Required
 */

model.getAccessToken = function (bearerToken, callback) {
    pg.connect(connString, function (err, client, done) {
        if (err) return callback(err);
        client.query('SELECT access_token, client_id, expires, user_id FROM oauth_access_tokens ' +
            'WHERE access_token = $1', [bearerToken], function (err, result) {
            if (err || !result.rowCount) return callback(err);
            // This object will be exposed in req.oauth.token
            // The user_id field will be exposed in req.user (req.user = { id: "..." }) however if
            // an explicit user object is included (token.user, must include id) it will be exposed
            // in req.user instead
            var token = result.rows[0];
            callback(null, {
                accessToken: token.access_token,
                clientId: token.client_id,
                expires: token.expires,
                userId: token.userId
            });
            done();
        });
    });
};

model.getClient = function (clientId, clientSecret, callback) {
    pg.connect(connString, function (err, client, done) {
        if (err) return callback(err);
        client.query('SELECT client_id, client_secret, redirect_uri FROM oauth_clients WHERE ' +
            'client_id = $1', [clientId], function (err, result) {
            if (err || !result.rowCount) return callback(err);
            var client = result.rows[0];
            if (clientSecret !== null && client.client_secret !== clientSecret) return callback();
            // This object will be exposed in req.oauth.client
            var returnVal = {
                clientId: client.client_id,
                clientSecret: client.client_secret,
                redirectUri : client.redirect_uri
            }
            callback(null, returnVal);
            done();
        });
    });
};

model.getRefreshToken = function (bearerToken, callback) {
    pg.connect(connString, function (err, client, done) {
        if (err) return callback(err);
        client.query('SELECT refresh_token, client_id, expires, user_id FROM oauth_refresh_tokens ' +
            'WHERE refresh_token = $1', [bearerToken], function (err, result) {
            // The returned user_id will be exposed in req.user.id
            callback(err, result.rowCount ? result.rows[0] : false);
            done();
        });
    });
};

// This will very much depend on your setup, I wouldn't advise doing anything exactly like this but
// it gives an example of how to use the method to resrict certain grant types
var authorizedClientIds = ['abc1', 'def2'];
model.grantTypeAllowed = function (clientId, grantType, callback) {

    if (grantType === 'password') {
        return callback(false, authorizedClientIds.indexOf(clientId.toLowerCase()) >= 0);
    }

    callback(false, true);
};

model.saveAccessToken = function (accessToken, clientId, expires, userId, callback) {
    pg.connect(connString, function (err, client, done) {
        if (err) return callback(err);
        client.query('INSERT INTO oauth_access_tokens(access_token, client_id, user_id, expires) ' +
            'VALUES ($1, $2, $3, $4)', [accessToken, clientId, userId, expires],
            function (err, result) {
                callback(err);
                done();
            });
    });
};

model.saveRefreshToken = function (refreshToken, clientId, expires, userId, callback) {
    pg.connect(connString, function (err, client, done) {
        if (err) return callback(err);
        client.query('INSERT INTO oauth_refresh_tokens(refresh_token, client_id, user_id, ' +
            'expires) VALUES ($1, $2, $3, $4)', [refreshToken, clientId, userId, expires],
            function (err, result) {
                callback(err);
                done();
            });
    });
};

model.saveAuthCode = function(authCode, clientId, expires, userId, callback){

    // for some reason, we're not adhering to the expires + 3600 seconds
    expires.setHours(expires.getHours() + 1)
    pg.connect(connString, function(err, client, done){
        if(err) return callback(err);
        client.query('INSERT INTO oauth_auth_codes(auth_code, client_id, expires, user_id) ' +
            'VALUES ($1, $2, $3, $4)', [authCode, clientId, expires, userId],
            function(err, result) {
                if(err) console.log('err from postgres ', err)
                callback(err)
                done()
            })
    })
}

model.getAuthCode = function(authCode, callback){
    pg.connect(connString, function(err, client, done){
        if(err) return callback(err)
        var query = 'SELECT auth_code, client_id, user_id, expires FROM oauth_auth_codes WHERE auth_code = \'' + authCode + '\''
        client.query(query, [], function(err, result){
            if(err) callback(err, null)
            var returnValue = {
                authCode : result.rows[0].auth_code
                , clientId: result.rows[0].client_id
                , userId: 'uuid_here' // grant takes two types, user = {id: 'uuid'}, or userId //result.rows[0].user_id // this is a hack temporarily
                , expires: result.rows[0].expires
            }
            callback(null, returnValue)
            done()
        })
    })
}

/*
 * Required to support password grant type
 */
model.getUser = function (username, password, callback) {
    pg.connect(connString, function (err, client, done) {
        if (err) return callback(err);
        client.query('SELECT id FROM users WHERE username = $1 AND password = $2', [username,
            password], function (err, result) {
            callback(err, result.rowCount ? result.rows[0] : false);
            done();
        });
    });
};