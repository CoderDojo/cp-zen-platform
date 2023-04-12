const _ = require('lodash');
const locale = require('locale');
const profileValidator = require('./utils/profile-validator.js');

module.exports = server => (request, reply) => {
  console.log("IN ON PREAUTH");

  const arrTranslateCookie =
    request.state && request.state.NG_TRANSLATE_LANG_KEY;
  let translateCookie = arrTranslateCookie;
  if (_.isArray(arrTranslateCookie)) {
    [translateCookie] = arrTranslateCookie;
  }
  const localesFormReq =
    (translateCookie && translateCookie.replace(/"/g, '')) ||
    request.headers['accept-language'];
  const requestLocales = new locale.Locales(localesFormReq);
  request.app.context = {
    locality: requestLocales.best(server.app.availableLocales).code,
  };



  console.log("REQUEST HERE IS ", request.user, request.auth);
  const authorization = request.headers.authorization
  console.log("HI THE AUTHORIZAION HEADER IS", authorization);
  if (authorization) {
    profileValidator(authorization, request, (user) => {
      console.log("PROFILE VALIDATOR USER IS: ", user);
      // TODO: fix here
      request.user = {id: user, roles:[]};
      console.log("LEAVING PREAUTH");
      return reply.continue();
    });

    // request.user = {"kittens": "cats"};
  } else {
    console.log("LEAVING PREAUTH 2");
    return reply.continue();
  }
};
