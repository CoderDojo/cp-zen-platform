(function() {
  'use strict';

  var gmap = function($q, $window) {
    var dfd = $q.defer();
    var doc = $window.document;
    var scriptId = 'gmapScript';
    var scriptTag = doc.getElementById(scriptId);
    if (scriptTag) {
      dfd.resolve(true);
      return true;
    }
    scriptTag = doc.createElement('script');
    scriptTag.id = scriptId;
    scriptTag.setAttribute('src',
      'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=mapReady&key=AIzaSyDlOskoHwHF560s_WgZzEP3_u4OWbWuec0');
    doc.head.appendChild(scriptTag);
    $window.mapReady = (function(dfd) {
      return function() {
        dfd.resolve(true);
        delete $window.mapReady;
      };
    }(dfd));

    return dfd.promise;
  };

  var resolveDojo = function($q, $stateParams, cdDojoService) {
    var dfd = $q.defer();
    if ($stateParams.id) {
      cdDojoService.load($stateParams.id,
        function(data) {
          dfd.resolve(data);
        }, function(err) {
          dfd.reject(err);
        });
    } else {
      cdDojoService.find({
        urlSlug: $stateParams.country + '/' + $stateParams.path
      }, function(data) {
        dfd.resolve(data);
      }, function(err) {
        dfd.reject(err);
      });
    }
    return dfd.promise;
  };

  var profileHelpers = {
    profile: function($stateParams, cdUsersService){
      return cdUsersService.listProfilesPromise({userId: $stateParams.userId}).then(
        function(data){
          return {data: data};
        }, function(err){
          return {err: err};
        });
    },
    initUserTypes: function(cdUsersService) {
      return cdUsersService.getInitUserTypesPromise().then(
        function (data){
          return {data: data};
        }, function (err) {
          return {err: err};
        });
    },
    loggedInUser: function(auth){
      return auth.get_loggedin_user_promise().then(function(data){
        return {data: data};
      }, function(err){
        return {err: err};
      });
    },
    usersDojos: function($stateParams, cdDojoService){
      return cdDojoService.getUsersDojosPromise({userId: $stateParams.userId})
        .then(function(data){
          return {data: data};
        }, function(err){
          return {err: err};
        });
    },
    hiddenFields: function(cdUsersService){
      return cdUsersService.getHiddenFieldsPromise().then(function(data){
        return {data: data};
      }, function(err){
        return {err: err};
      });
    },
    championsForUser: function ($stateParams, cdUsersService) {
      return cdUsersService.loadChampionsForUserPromise($stateParams.userId).then(function (data) {
        return {data: data};
      }, function (err) {
        return {err: err};
      });
    },
    parentsForUser: function ($stateParams, cdUsersService) {
      return cdUsersService.loadParentsForUserPromise($stateParams.userId).then(function (data) {
        return {data: data};
      }, function (err) {
        return {err: err};
      });
    },
    badgeCategories: function(cdBadgesService) {
      return cdBadgesService.loadBadgeCategoriesPromise().then(function (data) {
        return {data: data};
      }, function (err) {
        return {err: err};
      });
    },
    dojoAdminsForUser: function ($stateParams, cdUsersService) {
      return cdUsersService.loadDojoAdminsForUserPromise($stateParams.userId).then(function (data) {
        return {data: data};
      }, function (err) {
        return {err: err};
      });
    },
    agreement: function(cdAgreementsService, $stateParams, $window, auth){
      return auth.get_loggedin_user_promise().then(function (user) {
        return cdAgreementsService.loadUserAgreementPromise(user.id).then(function (data) {
          return {data: data};
        }, function (err) {
          return {err: err};
        });
      });
    }
  };

  angular.module('cpZenPlatform')
    .config(function($stateProvider, $urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider) {
      $locationProvider.html5Mode(true);
      function valToString(val)   { return val !== null ? val.toString() : val; }
      function valFromString(val) { return val !== null ? val.toString() : val; }
      $urlMatcherFactoryProvider.type('nonURIEncoded', {
        encode: valToString,
        decode: valFromString,
        is: function () { return true; }
      });
      $stateProvider
        .state("home", {
          url: "/",
          templateUrl: '/dojos/template/dojo-list',
          resolve: {
            gmap: gmap
          },
          params: {
            bannerType: null,
            bannerMessage: null
          },
          controller: 'dojo-list-controller'
        })
        .state("login", {
          url: "/login?referer",
          templateUrl: '/templates/login',
          controller: 'login',
          params: {
            referer: null
          }
        })
        .state("reset-password", {
          url: "/reset_password/:token",
          templateUrl: '/templates/reset_password',
          controller: 'login'
        })
        .state("register-account", {
          url: "/register?referer",
          templateUrl: '/dojos/template/start-dojo-wizard/step-one-register',
          params: {
            referer:null
          },
          controller: 'login'
        })
        .state("dojo-list-index", {
          url: "/dojo-list-index",
          templateUrl: '/dojos/template/dojo-list-index',
          controller: 'dojo-list-index-controller'
        })
        .state("dojo-detail", {
          url: "/dojo/{country:[a-zA-Z]{2}}/{path:nonURIEncoded}",
          templateUrl: '/dojos/template/dojo-detail',
          resolve: {
            dojo: resolveDojo,
            gmap: gmap
          },
          controller: 'dojo-detail-controller'
        })
        .state("dojo-detail-alt", {
          url: "/dojo/:id",
          templateUrl: '/dojos/template/dojo-detail',
          resolve: {
            dojo: resolveDojo,
            gmap: gmap
          },
          controller: 'dojo-detail-controller'
        })
        .state("start-dojo-wizard", {
          url: "/start-dojo",
          templateUrl: '/dojos/template/start-dojo-wizard/wizard',
          resolve: {
            gmap: gmap
          },
          controller: 'start-dojo-wizard-controller'
        })
        .state("terms-and-conditions", {
          url: "/terms-and-conditions",
          templateUrl: '/templates/terms-and-conditions',
          controller: 'terms-and-conditions-controller'
        })
        .state('charter',{
          url: '/charter',
          templateUrl: '/charter/template/charter-info'
        })
        .state('accept-child-invite',{
          url: '/accept-parent-guardian-request/:parentProfileId/:childProfileId/:inviteToken',
          controller: 'accept-child-controller',
          templateUrl: '/profiles/template/accept-child-invite'
        })
        .state("user-profile", {
          url: "/profile/:userId",
          templateUrl: '/dojos/template/user-profile',
          resolve: profileHelpers,
          controller: 'user-profile-controller'
        })
        .state('error-404', {
          url:'/404',
          templateUrl: '/errors/template/404'
        });
    })
    .config(function(paginationConfig) {
      paginationConfig.maxSize = 5;
      paginationConfig.rotate = false;
    })
    .factory('authHttpResponseInterceptor', ['$q', '$window',
      function($q, $window) {
        return {
          responseError: function(rejection) {
            if (rejection.status === 401) {
              $window.location = "/";
            }
            return $q.reject(rejection);
          }
        };
      }
    ])
    .config(['$httpProvider',
      function($httpProvider) {
        $httpProvider.interceptors.push('authHttpResponseInterceptor');
      }
    ])
    .config(['$translateProvider',
      function($translateProvider) {
        $translateProvider.useUrlLoader('/locale/data?format=mf')
        .useCookieStorage()
        .useSanitizeValueStrategy('sanitize')
        .registerAvailableLanguageKeys(['en_US', 'de_DE'])
        .determinePreferredLanguage()
        .fallbackLanguage('en_US');
      }
    ])
    .run(function ($window, $cookieStore) {
      var doc = $window.document;
      var googleCaptchaScriptId = 'loadCaptchaService';
      var googleCaptchaScriptTag = doc.getElementById(googleCaptchaScriptId);
      googleCaptchaScriptTag = doc.createElement('script');
      googleCaptchaScriptTag.id = googleCaptchaScriptId;
      var userLocality = $cookieStore.get('NG_TRANSLATE_LANG_KEY') || 'en_US';
      var userLangCode = userLocality ? userLocality.replace(/%22/g, '').split('_')[0] : 'en';
      googleCaptchaScriptTag.setAttribute('src',
        'https://www.google.com/recaptcha/api.js?onload=vcRecaptchaApiLoaded&render=explicit&hl=' + userLangCode);
      doc.head.appendChild(googleCaptchaScriptTag);
    })
    .service('cdApi', seneca.ng.web({
      prefix: '/api/1.0/'
    }));
})();

