const request = require('request-promise-native');
const {setRpiStateCookie, getAccountTypeRedirectUrl} = require("../rpi-auth");


function introspect(token) {
  var token_parts = token.split(/\s+/);  // clean up stupid copy paste whitespace

  var requestOptions = {
    url: process.env.RPI_AUTH_ADMIN_URL + 'oauth2/introspect',
    method: 'POST',
    headers: {
      "apikey": process.env.RPI_ADMIN_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    formData: {
      "token": token_parts[1]
    },
    json: true
  };
  console.log("SENDING REQUEST OPTIONS:", requestOptions)
  return request(requestOptions);
}

function getUserFromProfileId(user) {
  var fakeUserId = 'b6301f34-b970-4d4f-8314-f877bad8b150';
  console.log(`getUserFromProfileId called with id ${user} but using fake id ${fakeUserId} instead to test`);

  // const getZenUser = (rpiProfileId, callback) => {
  //   const seneca = this;
  //   seneca.act(
  //     {
  //       role: 'cd-users',
  //       cmd: 'get_user_by_raspberry_id',
  //       raspberryId: rpiProfileId
  //     },
  //     callback
  //   );
  // };
  //
  // // TODO: use the correct ID here not fake
  // getZenUser(fakeUserId, (err, zenUser) => {
  //   if (err) {
  //     console.log("ERROR GETTING NO ZEN USER: ", err);
  //     // TODO: use generic user friendly error
  //     return null;
  //   }
  //   if (zenUser) {
  //     console.log("OMG I FOUND ZEN USER HERE: ", zenUser);
  //     return zenUser;
  //   } else {
  //     console.log("NO ZEN USER FOUND");
  //   }
  // });

  return "e02e5452-ae29-435e-809e-fd998a6b0cc8";
}

module.exports = function (token, request, callback) {
  introspect(token)
    .then(function (body) {
      console.log("IN INTROSPECT BODY IS:", body)
      if (body.active && body.sub) {
        console.log("RESULT USER SUB HERE IS: ", body.sub);
        return body.sub;
      } else {
        console.log("USER NOT ACTIVE return null");
        return null;
      }
    })
    .then(function (user) {
      console.log("I have now got the user: ", user);
      return getUserFromProfileId(user);
    })
    .then(function (user) {
      console.log("After get User from profile id user: ", user);
      return callback(user);
    })
    .catch(function (err) {
      console.log("IN RESPONSE ERROR  return null:", err);
      return callback(null);
    });


};
