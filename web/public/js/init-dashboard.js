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
    if($stateParams.legacyId && _.isNumber(parseInt($stateParams.legacyId))) {
      cdDojoService.list({mysqlDojoId: parseInt($stateParams.legacyId)}, function (data) {
        dfd.resolve(data[0]);
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
    initUserTypes: function(cdUsersService) {
      return cdUsersService.getInitUserTypesPromise().then(winCb, failCb);
    },
    loggedInUser: function(auth){
      return auth.get_loggedin_user_promise().then(winCb, failCb);
    },
    usersDojos: function(auth, cdDojoService){
      return auth.get_loggedin_user_promise().then(function (currentUser) {
        return cdDojoService.getUsersDojosPromise({userId: currentUser.id}).then(winCb, failCb);
      }, failCb);
    },
    hiddenFields: function(cdUsersService){
      return cdUsersService.getHiddenFieldsPromise().then(winCb, failCb);
    },
    championsForUser: function ($stateParams, cdUsersService) {
      return cdUsersService.loadChampionsForUserPromise($stateParams.userId).then(winCb, failCb);
    },
    parentsForUser: function ($stateParams, cdUsersService) {
      return cdUsersService.loadParentsForUserPromise($stateParams.userId).then(winCb, failCb);
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
    ticketTypes: function (cdEventsService) {
      return cdEventsService.ticketTypesPromise().then(winCb, failCb);
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
          templateUrl: '/dojos/template/dojos-map',
          resolve: {
            gmap: gmap
          },
          params: {
            bannerType: null,
            bannerMessage: null,
            bannerTimeCollapse: null,
            pageTitle: 'Home'
          },
          controller: 'dojos-map-controller'
        })
        .state("dojo-list", {
          url: "/dashboard/dojo-list",
          templateUrl: '/dojos/template/dojos-map',
          resolve: {
            gmap: gmap
          },
          params: {
            bannerType: null,
            bannerMessage: null,
            bannerTimeCollapse: null,
            pageTitle: 'Home'
          },
          controller: 'dojos-map-controller'
        })
        .state("my-dojos", {
          url: "/dashboard/my-dojos",
          templateUrl: '/dojos/template/my-dojos',
          controller: 'my-dojos-controller',
          params: {
            pageTitle: 'My Dojos'
          },
          ncyBreadcrumb: {
            label: '{{myDojosPageTitle}}'
          }
        })
        .state("edit-dojo", {
          url: "/dashboard/edit-dojo/:id",
          templateUrl: '/dojos/template/edit-dojo',
          resolve: {
            gmap: gmap,
            currentUser: resolves.loggedInUser
          },
          params: {
            pageTitle: 'Edit Dojo'
          },
          controller: 'edit-dojo-controller'
        })
        .state("dojo-detail", {
          url: "/dashboard/dojo/{country:[a-zA-Z]{2}}/{path:nonURIEncoded}",
          templateUrl: '/dojos/template/dojo-detail',
          resolve: {
            dojo: resolveDojo,
            gmap: gmap,
            currentUser: resolves.loggedInUser
          },
          params: {
            pageTitle: 'Dojo'
          },
          controller: 'dojo-detail-controller'
        })
        .state("dojo-detail-alt", {
          url: "/dashboard/dojo/:legacyId",
          templateUrl: '/dojos/template/dojo-detail',
          resolve: {
            dojo: resolveDojo,
            gmap: gmap,
            currentUser: resolves.loggedInUser
          },
          params: {
            pageTitle: 'My Dojos'
          },
          controller: 'dojo-detail-controller'
        })
        .state("manage-dojos", {
          url: "/dashboard/manage-dojos",
          templateUrl: '/dojos/template/manage-dojos',
          params: {
            pageTitle: 'Manage Dojos'
          },
          controller: 'manage-dojo-controller'
        })
        .state("user-events", {
          url: "/dashboard/dojos/events/user-events",
          templateUrl: '/dojos/template/events/user-events',
          controller: 'user-events-controller',
          params: {
            pageTitle: 'My Events'
          },
          resolve: {
            currentUser: resolves.loggedInUser,
            usersDojos: resolves.usersDojos
          }
        })
        .state("my-dojos.manage-dojo-events", {
          url: "/:dojoId/events",
          templateUrl: '/dojos/template/events/manage-dojo-events',
          controller: 'manage-dojo-events-controller',
          params: {
            pageTitle: 'Manage Dojo Events'
          },
          ncyBreadcrumb: {
            label: '{{manageDojoEventsPageTitle}}'
          }
        })
        .state("my-dojos.manage-dojo-events.manage-applications", {
          url: "/:eventId/applications",
          templateUrl: '/dojos/template/events/manage-event-applications',
          controller: 'manage-event-applications-controller',
          params: {
            pageTitle: 'Applicants'
          },
          ncyBreadcrumb: {
            label: '{{manageDojoEventApplicationsPageTitle}}'
          },
          resolve: {
            currentUser: resolves.loggedInUser
          }
        })
        .state("create-dojo-event", {
          url: "/dashboard/dojo/:dojoId/event-form",
          templateUrl: '/dojos/template/events/dojo-event-form',
          resolve: {
            gmap: gmap,
            ticketTypes: resolves.ticketTypes,
            currentUser: resolves.loggedInUser
          },
          params: {
            pageTitle: 'Create Event'
          },
          controller: 'dojo-event-form-controller'
        })
        .state("edit-dojo-event", {
          url: "/dashboard/dojo/:dojoId/event-form/:eventId",
          templateUrl: '/dojos/template/events/dojo-event-form',
          resolve: {
            gmap: gmap,
            ticketTypes: resolves.ticketTypes,
            currentUser: resolves.loggedInUser
          },
          params: {
            pageTitle: 'Edit Event'
          },
          controller: 'dojo-event-form-controller'
        })
        .state("stats", {
          url: "/dashboard/stats",
          templateUrl: '/dojos/template/stats',
          params: {
            pageTitle: 'Stats'
          },
          controller: 'stats-controller'
        })
        .state("start-dojo", {
          url: "/dashboard/start-dojo",
          templateUrl: '/dojos/template/start-dojo-wizard/wizard',
          resolve: {
            gmap: gmap
          },
          params: {
            pageTitle: 'Start a Dojo'
          },
          controller: 'start-dojo-wizard-controller'
        })
        .state("review-champion-application", {
          url: "/dashboard/champion-applications/:id",
          templateUrl: '/champion/template/review-application',
          params: {
            pageTitle: 'Review Champion Application'
          },
          controller: 'review-champion-application-controller'
        })
        .state("my-dojos.manage-dojo-users", {
          url: "/dojo/:id/users",
          templateUrl: '/dojos/template/manage-dojo-users',
          controller: 'manage-dojo-users-controller',
          params: {
            pageTitle: 'Manage Dojo Users'
          },
          ncyBreadcrumb: {
            label: '{{manageDojoUsersPageTitle}}'
          },
          resolve: {
            initUserTypes: resolves.initUserTypes,
            currentUser: resolves.loggedInUser
          }
        })
		    .state("setup-dojo", {
          url: "/dashboard/setup-dojo/:id",
          templateUrl: '/dojos/template/setup-dojo',
          params: {
            pageTitle: 'Setup Dojo'
          },
          controller: 'setup-dojo-controller'
        })
        .state('charter',{
          url: '/charter',
          params: {
            pageTitle: 'Charter'
          },
          templateUrl: '/charter/template/charter-info'
        })
        .state('charter-page', {
          url: '/dashboard/charter',
          templateUrl: '/charter/template/index',
          controller: 'charter-controller',
          resolve: {
            currentUser: resolves.loggedInUser
          },
          params: {
            pageTitle: 'Charter',
            showBannerMessage: null
          }
        })
        .state("accept-dojo-user-invitation", {
          url: "/dashboard/accept_dojo_user_invitation/:dojoId/:userInviteToken",
          templateUrl: '/dojos/template/accept-dojo-user-invitation',
          controller: 'accept-dojo-user-invitation-controller'
        })
        .state("accept-dojo-user-request", {
          url: "/dashboard/accept_dojo_user_request/:userId/:userInviteToken",
          templateUrl: '/dojos/template/accept-dojo-user-request',
          controller: 'accept-dojo-user-request-controller'
        })
        .state('add-child',{
          url: "/dashboard/profile/child/add/:userType/:parentId",
          templateUrl: '/dojos/template/user-profile',
          resolve: resolves,
          controller: 'user-profile-controller'
        })
        .state('accept-child-invite',{
          url: '/dashboard/accept_parent_guardian_request/:childProfileId/:inviteToken',
          controller: 'accept-child-controller',
          templateUrl: '/profiles/template/accept-child-invite'
        })
        .state("user-profile", {
          url: "/dashboard/profile/:userId",
          templateUrl: '/dojos/template/user-profile',
          resolve: resolves,
          controller: 'user-profile-controller'
        })
        .state('edit-user-profile', {
          url:'/dashboard/profile/:userId/edit',
          controller: 'user-profile-controller',
          resolve: resolves,
          params: {
            showBannerMessage: null
          },
          templateUrl: '/dojos/template/user-profile'
        })
        .state('badges-dashboard', {
          url:'/dashboard/badges',
          controller:'badges-dashboard-controller',
          params: {
            pageTitle: 'Badges'
          },
          templateUrl: '/dojos/template/badges/index'
        })
        .state('accept-badge', {
          url:'/dashboard/badges/accept/:userId/:badgeSlug',
          controller:'accept-badge-controller',
          params: {
            pageTitle: 'Accept Badge'
          },
          templateUrl: '/dojos/template/badges/accept'
        })
        .state('error-404-no-headers', {
          url:'/dashboard/404',
          params: {
            pageTitle: 'Page not found'
          },
          templateUrl: '/errors/template/404_no_headers'
        })
        .state('approve-invite-ninja', {
          url:'/dashboard/approve_invite_ninja/:parentProfileId/:inviteTokenId',
          controller:'approve-invite-ninja-controller',
          templateUrl: '/profiles/template/approve-invite-ninja',
          params: {
            pageTitle: 'Approve Ninja'
          },
          resolve: {
            currentUser: resolves.loggedInUser
          }
        })
        .state('accept-session-invite', {
          url:'/dashboard/accept_session_invitation/:ticketId/:invitedUserId',
          controller:'accept-session-invite-controller',
          templateUrl: '/dojos/template/events/accept-session-invite',
          resolve: {
            currentUser: resolves.loggedInUser
          }
        });
      $urlRouterProvider.when('', '/');
      $urlRouterProvider.otherwise('/404');
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
        }
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
        .registerAvailableLanguageKeys(['en_US', 'it_IT'])
        .uniformLanguageTag('java')
        .determinePreferredLanguage()
        .fallbackLanguage('en_US');
      }
    ])
    .config(function (tagsInputConfigProvider) {
      tagsInputConfigProvider.setTextAutosizeThreshold(40);
    })
    .config(function(IdleProvider, KeepaliveProvider) {
      IdleProvider.idle(172800); // 2 days
      IdleProvider.timeout(10);
    })
    .config(function (tmhDynamicLocaleProvider) {
      tmhDynamicLocaleProvider.localeLocationPattern('/components/angular-i18n/angular-locale_{{locale}}.js');
    })
    .run(function ($rootScope, $state, $cookieStore, $translate, $document, $filter, verifyProfileComplete, alertService) {
      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        var publicStates = ['dojo-list', 'badges-dashboard', 'start-dojo'];
        if(!$cookieStore.get('verifyProfileComplete') && !_.contains(publicStates, toState.name)) {
          if(toState.name !== 'edit-user-profile') {
            verifyProfileComplete().then(function (verifyProfileResult) {
              if(!verifyProfileResult.complete) {
                $state.go('edit-user-profile', {
                  showBannerMessage: true,
                  userId: verifyProfileResult.userId
                });
              } else {
                $cookieStore.put('verifyProfileComplete', true);
              }
            }, function (err) {
              alertService.showError($translate.instant('An error has occured verifying your profile.'));
            });
          }
        }
      });
      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
        $document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;

        var pageTitle = [];
        if(toParams.pageTitle) {
          pageTitle.push($filter('translate')(toParams.pageTitle));
        }
        pageTitle.push("CoderDojo Zen");
        $rootScope.pageTitle = pageTitle.join(" | ");
      });
    })
    .run(function ($window, $cookieStore, tmhDynamicLocale) {
      var userLocality = $cookieStore.get('NG_TRANSLATE_LANG_KEY') || 'en_US';
      var userLangCode = userLocality ? userLocality.replace(/%22/g, '').split('_')[0] : 'en';
      tmhDynamicLocale.set(userLangCode);
    })
    .factory('verifyProfileComplete', function (cdUsersService, auth, $q) {
      return function () {
        var deferred = $q.defer();
        auth.get_loggedin_user_promise().then(function (user) {
          if(user && user.id) {
            cdUsersService.userProfileDataPromise({userId: user.id}).then(function (profile) {
              deferred.resolve({complete: profile.requiredFieldsComplete, userId: user.id});
            }, function (err) {
              deferred.reject(err);
            });
          } else {
            deferred.reject(new Error('User not found.'));
          }
        }, function (err) {
          deferred.reject(err);
        });
        return deferred.promise;
      }
    })
    .run(function (Idle){
      Idle.watch();
    })
    .controller('cdDashboardCtrl', function ($scope, $modal, $cookieStore, $window, Idle, auth) {
      $scope.$on('IdleTimeout', function() {
        //session timeout
        $cookieStore.remove('verifyProfileComplete');
        $cookieStore.remove('canViewYouthForums');
        auth.logout(function(data){
          $window.location.href = '/'
        })
      });
    });
})();
