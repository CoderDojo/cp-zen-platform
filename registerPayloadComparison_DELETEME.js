module.exports = {
  registerPayload: {
    user: {
      firstName: 'Jedd',
      lastName: 'Fenner',
      email: 'test@test.com',
      password: 'womprat12',
      termsConditionsAccepted: true,
      'g-recaptcha-response': '<>',
      emailSubject: 'Welcome to Zen, the CoderDojo community platform.',
      initUserType: [Object],
    },
    profile: {
      dob: '2001-01-01T00:00:00.000Z',
      country: {
        countryName: 'United Kingdom',
        countryNumber: '826',
        continent: 'EU',
        alpha2: 'GB',
        alpha3: 'GBR',
      },
    },
    recaptchaResponse: '<>',
  },
  profileCbPayload: {
    aud: 'coderdojo-dev',
    auth_time: 1576844758,
    country: 'United Kingdom',
    email: 'test12@test.dev',
    exp: 1576848358,
    iat: 1576844758,
    iss: 'http://localhost:9000',
    name: 'Test',
    nickname: 'Testnick',
    nonce: '086ad5d0-b57d-4fbe-9352-7f0658f817ec',
    picture:
      'http://localhost:3002/profile/bb900a0e-58fa-48f7-91d2-7e190b92cdb4/avatar',
    postcode: 'S7 1DG',
    profile: 'http://localhost:3002/profile',
    rat: 1576844758,
    sub: 'bb900a0e-58fa-48f7-91d2-7e190b92cdb4',
    uuid: 'bb900a0e-58fa-48f7-91d2-7e190b92cdb4',
  },
};
