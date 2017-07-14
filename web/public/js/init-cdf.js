(function() {
  'use strict';

  // TODO : centralize resolve for both init-*
  var resolveDojo = function($q, $stateParams, cdDojoService) {
    var dfd = $q.defer();
    if($stateParams.legacyId && _.isNumber(parseInt($stateParams.legacyId))) {
      cdDojoService.list({mysqlDojoId: parseInt($stateParams.legacyId)}, function (data) {
        dfd.resolve(data[0]);
      }, function (err) {
        dfd.reject(err);
      });
    } else if( ($stateParams.dojoId && !_.isNumber($stateParams.dojoId) ) ||
      ($stateParams.id && !_.isNumber($stateParams.dojoId) ) ) {
        var id = $stateParams.dojoId || $stateParams.id;
        cdDojoService.load(id,
        function (data) {
          dfd.resolve(data);
        }, function (err) {
          dfd.reject(err);
      });
    } else if($stateParams.country && $stateParams.path && _.isString($stateParams.country) && _.isString($stateParams.path)) {
      cdDojoService.find({
        urlSlug: $stateParams.country + '/' + $stateParams.path
      }, function(data) {
        dfd.resolve(data);
      }, function(err) {
        dfd.reject(err);
      });
    } else {
      dfd.reject(new Error('No Dojo found.'));
    }
    return dfd.promise;
  };

  var failCb = function(err){
    return {err: err};
  };

  var winCb = function(data){
    return {data: data};
  };

  var resolves = {
    profile: function($stateParams, cdUsersService){
      return cdUsersService.userProfileDataPromise({userId: $stateParams.userId}).then(winCb, failCb);
    },
    // profile is silently failling to allow us to use optional resolves
    ownProfile: function(auth, cdUsersService){
      return auth.get_loggedin_user_promise().then(function (currentUser) {
        if(currentUser){
          return cdUsersService.userProfileDataPromise({userId: currentUser.id}).then(winCb, failCb);
        } else {
          winCb(void 0);
        }
      }, failCb);
    },
    initUserTypes: function(cdUsersService) {
      return cdUsersService.getInitUserTypesPromise().then(winCb, failCb);
    },
    loggedInUser: function(auth){
      return auth.get_loggedin_user_promise().then(winCb, failCb);
    },
    usersDojos: function(auth, cdDojoService){
      return auth.get_loggedin_user_promise().then(function (currentUser) {
        if(currentUser){
          return cdDojoService.getUsersDojosPromise({userId: currentUser.id}).then(winCb, failCb);
        } else {
          winCb(void 0);
        }
      }, failCb);
    },
    hiddenFields: function(cdUsersService){
      return cdUsersService.getHiddenFieldsPromise().then(winCb, failCb);
    },
    championsForUser: function ($stateParams, cdUsersService) {
      return cdUsersService.loadChampionsForUserPromise($stateParams.userId).then(winCb, failCb);
    },
    championsForLoggedInUser: function ($stateParams, cdUsersService, auth) {
      return auth.get_loggedin_user_promise().then(function (currentUser) {
        if(currentUser){
          return cdUsersService.loadChampionsForUserPromise(currentUser.id).then(winCb, failCb);
        } else {
          winCb(void 0);
        }
      }, failCb);
    },
    parentsForUser: function ($stateParams, cdUsersService) {
      return cdUsersService.loadParentsForUserPromise($stateParams.userId).then(winCb, failCb);
    },
    parentsForLoggedInUser: function ($stateParams, cdUsersService, auth) {
      return auth.get_loggedin_user_promise().then(function (currentUser) {
        if(currentUser){
          return cdUsersService.loadParentsForUserPromise(currentUser.id).then(winCb, failCb);
        } else {
          winCb(void 0);
        }
      }, failCb);
    },
    badgeCategories: function(cdBadgesService) {
      return cdBadgesService.loadBadgeCategoriesPromise().then(winCb, failCb);
    },
    agreement: function(cdAgreementsService, $stateParams, $window, auth){
      return auth.get_loggedin_user_promise().then(function (user) {
        return cdAgreementsService.loadUserAgreementPromise(user.id).then(winCb, failCb);
      });
    },
    dojoAdminsForUser: function ($stateParams, cdUsersService) {
      return cdUsersService.loadDojoAdminsForUserPromise($stateParams.userId).then(winCb, failCb);
    },
    dojoAdminsForLoggedInUser: function ($stateParams, cdUsersService, auth) {
      return auth.get_loggedin_user_promise().then(function (currentUser) {
        if(currentUser){
          return cdUsersService.loadDojoAdminsForUserPromise(currentUser.id).then(winCb, failCb);
        } else {
          winCb(void 0);
        }
      }, failCb);
    },
    ticketTypes: function (cdEventsService) {
      return cdEventsService.ticketTypesPromise().then(winCb, failCb);
    },
    event: function($stateParams, cdEventsService){
      return cdEventsService.loadPromise($stateParams.eventId).then(winCb, failCb);
    },
    sessions: function($stateParams, cdEventsService){
      return cdEventsService.searchSessionsPromise({eventId: $stateParams.eventId, status: 'active'}).then(winCb, failCb);
    },
    isSessionValid: function(auth){
      return auth.get_cdf_loggedin_user_promise().then(function (user) {
        if (user && _.includes(user.roles, 'cdf-admin')) {
          return true;
        }
        return false;
      });
    }

  };




  angular.module('cpZenPlatform')
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$urlMatcherFactoryProvider', function($stateProvider, $urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider) {
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
          params: {
            pageTitle: 'Home'
          }
        })
        .state("login", {
          url: "/login?referer&next",
          template: '<cdf-login></cdf-login>',
          params: {
            referer: null,
            next: null,
            pageTitle: 'Login'
          }
        })
        .state("dashboard", {
          url: "/dashboard",
          template: '<cdf-dashboard></cdf-dashboard>',
          resolve: {
            isSessionValid: resolves.isSessionValid
          },
          controller: ['isSessionValid', '$state', function(isSessionValid, $state) {
            if (!isSessionValid) {
              $state.go('login');
            }
          }]
        })
        .state("stats", {
          parent: 'dashboard',
          url: "/stats",
          templateUrl: '/dojos/template/stats',
          params: {
            pageTitle: 'Stats'
          },
          controller: 'stats-controller',
        })
        .state("polls", {
          parent: 'dashboard',
          url: "/polls",
          template: '<cdf-polls></cdf-polls>',
        })
        .state("poll-results", {
          parent: 'dashboard',
          url: "/polls/:pollId/results",
          template: '<cdf-poll-details></cdf-poll-details>',
        })
        .state("orgs", {
          parent: 'dashboard',
          url: "/orgs",
          template: '<cdf-org-list></cdf-org-list>',
        })
        .state("org-users", {
          parent: 'dashboard',
          url: "/orgs/:orgId/users",
          template: '<cdf-org-user-list></cdf-org-user-list>',
        });
      $urlRouterProvider.when('', '/');
      $urlRouterProvider.otherwise(function ($injector, $location) {
        var $state = $injector.get('$state');
        $state.go('error-404-no-headers');
      });
    }])
    .config(['uibPaginationConfig', function(uibPaginationConfig) {
      uibPaginationConfig.maxSize = 5;
      uibPaginationConfig.rotate = false;
    }])
    .config(['ipnConfig', function (ipnConfig) {
      ipnConfig.nationalMode = false;
    }])
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
    .config(['$translateProvider', '$cookiesProvider',
      function($translateProvider, $cookiesProvider) {
        $cookiesProvider.defaults.path = '/';
        $translateProvider.useUrlLoader('/locale/data?format=mf')
        .useCookieStorage()
        .useSanitizeValueStrategy('sanitizeParameters')
        .uniformLanguageTag('java')
        .registerAvailableLanguageKeys(
          ['en_US', 'nl_NL', 'de_DE', 'it_IT', 'pl_PL', 'mt_MT',
            'pt_PT', 'es_ES', 'tr_TR', 'bg_BG', 'el_GR', 'et_EE',
            'hi_IN', 'ja_JP', 'ro_RO', 'es_AR', 'fr_FR', 'uk_UK',
          'sl_SL', 'sk_SK'],
          {
           'en': 'en_US', 'nl': 'nl_NL', 'de': 'de_DE', 'it': 'it_IT', 'pl': 'pl_PL', 'mt': 'mt_MT',
           'pt': 'pt_PT', 'es': 'es_ES', 'tr': 'tr_TR', 'bg': 'bg_BG', 'el': 'el_GR', 'et': 'et_EE',
           'hi': 'hi_IN', 'ja': 'ja_JP', 'ro': 'ro_RO', 'fr': 'fr_FR', 'uk': 'uk_UK',
           'sl': 'sl_SL', 'sk': 'sk_SK'
        })
        .determinePreferredLanguage()
        .fallbackLanguage('en_US');
      }
    ])
    .config(['tagsInputConfigProvider', function (tagsInputConfigProvider) {
      tagsInputConfigProvider.setTextAutosizeThreshold(40);
    }])
    .config(['IdleProvider', 'KeepaliveProvider', function(IdleProvider, KeepaliveProvider) {
      IdleProvider.idle(172800); // 2 days
      IdleProvider.timeout(10);
    }])
    .config(['tmhDynamicLocaleProvider', function (tmhDynamicLocaleProvider) {
      tmhDynamicLocaleProvider.localeLocationPattern('/components/angular-i18n/angular-locale_{{locale}}.js');
    }])
    .config(['$sceDelegateProvider', function ($sceDelegateProvider) {
      $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'https://s3-eu-west-1.amazonaws.com/zen-dojo-images/**'
      ]);
    }])
    .run(['$window', '$cookieStore', 'tmhDynamicLocale', function ($window, $cookieStore, tmhDynamicLocale) {
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
      tmhDynamicLocale.set(userLangCode);
    }])
    .run(['$rootScope', '$filter', '$state', 'embedder', '$cookieStore', '$document', 'alertService', '$translate', '$location',
     function($rootScope, $filter, $state, embedder, $cookieStore, $document, alertService, $translate, $location){
      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
        $document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;

        var pageTitle = [];
        if(toParams.pageTitle) {
          pageTitle.push($filter('translate')(toParams.pageTitle));
        }
        pageTitle.push("CoderDojo Zen");
        $rootScope.pageTitle = pageTitle.join(" | ");
      });

      //  uncomment when debugging routing error
      $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        console.log(toState, toParams, error);
      });
    }])
    .run(function ($window, $cookieStore, tmhDynamicLocale) {
      var userLocality = $cookieStore.get('NG_TRANSLATE_LANG_KEY') || 'en_US';
      var userLangCode = userLocality ? userLocality.replace(/%22/g, '').split('_')[0] : 'en';
      tmhDynamicLocale.set(userLangCode);
    })
    .run(['Idle', function (Idle){
      Idle.watch();
    }])
})();
