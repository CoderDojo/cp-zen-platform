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
      'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=mapReady&key=AIzaSyC3xF9XV91bS2R14Gjmx3UQaKbGgAfHbE4');
    doc.head.appendChild(scriptTag);
    $window.mapReady = (function(dfd) {
      return function() {
        //since we're loading gmap asyncly, we need to load any lib depending on it the same way
        var scriptTag = doc.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.setAttribute('src',
          '/components/google-maps-utility-library-v3/styledmarker/src/StyledMarker.js');
        doc.head.appendChild(scriptTag);
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
    profile: function($stateParams, cdUsersService, $q){
      if ($stateParams.userId) {
        return cdUsersService.userProfileDataPromise({userId: $stateParams.userId}).then(winCb, failCb);
      } else {
        return $q.resolve({
          data: {
            error: 'userId not provided'
          }
        });
      }
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
    championsForUser: function ($stateParams, cdUsersService, $q) {
      if ($stateParams.userId) {
        return cdUsersService.loadChampionsForUserPromise($stateParams.userId).then(winCb, failCb);
      } else {
        return $q.resolve({
          data: []
        });
      }
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
    parentsForUser: function ($stateParams, cdUsersService, $q) {
      if ($stateParams.userId) {
        return cdUsersService.loadParentsForUserPromise($stateParams.userId).then(winCb, failCb);
      } else {
        return $q.resolve({
          data: []
        });
      }
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
    dojoAdminsForUser: function ($stateParams, cdUsersService, $q) {
      if ($stateParams.userId) {
        return cdUsersService.loadDojoAdminsForUserPromise($stateParams.userId).then(winCb, failCb);
      } else {
        return $q.resolve({
          data: []
        });
      }
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
    }
  };




  angular.module('cpZenPlatform')
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$urlMatcherFactoryProvider',
        function($stateProvider, $urlRouterProvider, $locationProvider, $urlMatcherFactoryProvider) {
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
            url: "/?search&list",
            templateUrl: '/dojos/template/dojos-map',
            resolve: {
              gmap: gmap
            },
            params: {
              bannerType: null,
              bannerMessage: null,
              pageTitle: 'Home'
            },
            controller: 'dojos-map-controller',
            reloadOnSearch: false
          })
        .state("dashboard", {
          url: "/dashboard",
          template: '<ui-view></ui-view>',
          abstract: true
        })
        .state("login", {
          url: "/login?referer&next",
          template: '<cd-login></cd-login>',
          controller: 'login',
          params: {
            referer: null,
            next: null,
            pageTitle: 'Login'
          }
        })
        .state("logout", {
          url: "/logout?referer",
          template: '<span us-spinner="{radius:30, width:8, length: 16}"></span>',
          controller: 'logout',
          params: {
            referer: null,
            pageTitle: 'Logout'
          }
        })
        .state("reset", {
          url: "/reset?referer",
          template: '<cd-reset></cd-reset>',
          controller: 'login',
          params: {
            referer: null,
            pageTitle: 'Password Reset'
          }
        })
        .state("reset-password", {
          url: "/reset_password/:token",
          template: '<cd-reset-password></cd-reset-password>',
          controller: 'login',
          params: {
            pageTitle: 'Reset Password'
          }
        })
        .state("register-account", {
          url: "/register?referer",
          template: '<cd-register></cd-register>',
          abstract: true,
          params: {
            referer: null,
            userType: null,
            eventId: null,
            pageTitle: 'Register'
          },
          controller: 'login'
        })
        .state("register-account.require", {
          url: "/account",
          template: '<div class="col-xs-12 col-md-6">'+
            '<cd-register-user ng-init="size=\'col-xs-12\'; buttonSize=\'col-xs-4\'"></cd-register-user></div>' +
          '<div class="col-xs-12 col-md-6">' +
            '<cd-login ng-init="size=\'col-xs-12\';"></cd-login></div>',
          params: {
            pageTitle: 'Register',
          }
        })
        .state("register-account.user", {
          url: "/user",
          template:
          '<cd-register-user></cd-register-user>',
          params: {
            referer:null,
          }
        })
        .state("register-account.profile", {
          url: "/profile",
          template: '<cd-register-profile></cd-register-profile>',
          params: {
          }
        })
        .state("stats", {
          url: "/stats",
          parent: 'dashboard',
          templateUrl: '/dojos/template/stats',
          params: {
            pageTitle: 'Stats'
          },
          controller: 'stats-controller'
        })
        .state("review-champion-application", {
          url: "/champion-applications/:id",
          parent: 'dashboard',
          templateUrl: '/champion/template/review-application',
          params: {
            pageTitle: 'Review Champion Application'
          },
          controller: 'review-champion-application-controller'
        })
        .state("manage-dojo-users", {
          url: "/my-dojos/:id/users",
          parent: 'dashboard',
          // abstract: true, // Dropped to support redirection to default state, supported in uiRouter 1.0
          redirectTo: 'manage-dojo-active-users',
          template: '<cd-manage-dojo-users></cd-manage-dojo-users>',
          controller: ['initUserTypes', 'currentUser', '$scope',
            function (initUserTypes, currentUser, $scope) {
              $scope.initUserTypes = initUserTypes;
              $scope.currentUser = currentUser.data;
          }],
          params: {
            pageTitle: 'Manage Dojo Users'
          },
          resolve: {
            initUserTypes: resolves.initUserTypes,
            currentUser: resolves.loggedInUser
          }
        })
        .state("manage-dojo-active-users", {
          url: "",
          parent: 'manage-dojo-users',
          template: '<cd-dojo-manage-active-users></cd-dojo-manage-active-users>',
          params: {
            pageTitle: 'Manage Dojo Active Users'
          }
        })
        .state("manage-dojo-pending-users", {
          url: "/pending",
          parent: 'manage-dojo-users',
          template: '<cd-dojo-manage-pending-users init-user-types="initUserTypes"></cd-dojo-manage-pending-users>',
          params: {
            pageTitle: 'Manage Dojo Pending Users'
          }
        })
        .state("setup-dojo", {
          url: "/setup-dojo/:id",
          parent: 'dashboard',
          templateUrl: '/dojos/template/setup-dojo',
          params: {
            pageTitle: 'Setup Dojo'
          },
          controller: 'setup-dojo-controller'
        })
        .state("dojo-list", {
          url: "/dojo-list?search",
          parent: 'dashboard',
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
        .state("dojo-list-index", {
          url: "/dojo-list-index",
          templateUrl: '/dojos/template/dojo-list-index',
          controller: 'dojo-list-index-controller',
          params: {
            pageTitle: 'Dojo List',
            list: 'true'
          }
        })
        .state("manage-dojos", {
          url: "/manage-dojos",
          parent: 'dashboard',
          templateUrl: '/dojos/template/manage-dojos',
          params: {
            pageTitle: 'Manage Dojos'
          },
          controller: 'manage-dojo-controller'
        })
        .state("my-dojos", {
          url: "/my-dojos",
          parent: 'dashboard',
          templateUrl: '/dojos/template/my-dojos',
          controller: 'my-dojos-controller',
          params: {
            pageTitle: 'My Dojos'
          },
        })
        .state("dojo-detail", {
          url: "/dojo/{country:[a-zA-Z]{2}}/{path:nonURIEncoded}",
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
          url: "/dojo/:legacyId",
          templateUrl: '/dojos/template/dojo-detail',
          resolve: {
            dojo: resolveDojo,
            gmap: gmap,
            currentUser: resolves.loggedInUser
          },
          controller: 'dojo-detail-controller'
        })
        .state("edit-dojo", {
          url: "/edit-dojo/:id",
          parent: 'dashboard',
          templateUrl: '/dojos/template/edit-dojo',
          resolve: {
            dojo: resolveDojo,
            gmap: gmap,
            currentUser: resolves.loggedInUser
          },
          params: {
            pageTitle: 'Edit Dojo'
          },
          controller: 'edit-dojo-controller'
        })
        .state("manage-dojo-events", {
          url: "/my-dojos/:dojoId/events",
          parent: 'dashboard',
          templateUrl: '/dojos/template/events/manage-dojo-events',
          controller: 'manage-dojo-events-controller',
          params: {
            pageTitle: 'Manage Dojo Events'
          },
        })
        .state("manage-applications", {
          url: "/my-dojos/:dojoId/events/:eventId/applications",
          parent: 'dashboard',
          templateUrl: '/dojos/template/events/manage-event-applications',
          controller: 'manage-event-applications-controller',
          params: {
            pageTitle: 'Applicants'
          },
          resolve: {
            currentUser: resolves.loggedInUser,
            event: resolves.event
          }
        })
        .state("create-dojo-event", {
          url: "/dojo/:dojoId/event-form",
          parent: 'dashboard',
          template: '<cd-create-event></cd-create-event>',
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
          url: "/dojo/:dojoId/event-form/:eventId",
          parent: 'dashboard',
          template: '<cd-create-event></cd-create-event>',
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
        .state("dojo-event-details", {
          url: "/dojo/:dojoId/event/:eventId",
          template: '<cd-event-detail></cd-event-detail>',
          controller: function($scope, dojo, event, sessions, profile, currentUser){
            $scope.dojo = dojo;
            $scope.event = event.data;
            $scope.sessions = sessions.data;
            if (profile){
              $scope.profile = profile.data;
            }
            $scope.currentUser = currentUser;
          },
          params: {
            pageTitle: 'Event details',
            joinDojo: false,
            eventId: null
          },
          resolve: {
            profile: resolves.ownProfile,
            dojo: resolveDojo,
            sessions: resolves.sessions,
            event: resolves.event,
            currentUser: resolves.loggedInUser
          },
        })
        .state("user-events", {
          url: "/dojos/events/user-events",
          parent: 'dashboard',
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
        .state("event",{
          url: "/event/:eventId",
          template: '<cd-event-detail></cd-event-detail>',
          controller: function($scope, event, sessions, profile){
            $scope.event = event.data;
            $scope.sessions = sessions.data;
            if(profile){
              $scope.profile = profile.data;
            }
          },
          params: {
            pageTitle: 'Event details',
            joinDojo: false,
            eventId: null
          },
          resolve: {
            sessions: resolves.sessions,
            event: resolves.event,
            profile: resolves.ownProfile
          },
        })
        .state("embedded", {
          url: "/embedded",
          template: '<ui-view/>',
          abstract : true
        })
        .state("embedded.event",{
          parent : 'embedded',
          url: "/event/:eventId",
          template: '<div class="cd-event-list col-xs-12"><cd-event-list-item class="row flex-row cd-event-list-item cd-event-list-item--embedded" event="event"></cd-event-list-item></div>',
          controller: function($scope, event, sessions, profile){
            $scope.event = event.data;
            $scope.sessions = sessions.data;
            if(profile){
              $scope.profile = profile.data;
            }
          },
          params: {
            pageTitle: 'Event details',
            joinDojo: false,
            eventId: null
          },
          resolve: {
            sessions: resolves.sessions,
            event: resolves.event,
            profile: resolves.ownProfile
          },
        })
        .state("embedded.dojo-map",{
          parent : 'embedded',
          url: "/dojos-map/lat/:lat/lon/:lon?zoom",
          template: '<cd-dojos-map class="col-xs-12"></cd-dojos-map>',
          resolve: {
            gmap: gmap
          },
          controller: function( $scope, gmap ){
            $scope.gmap = gmap;
          },
          params: {
            pageTitle: 'Dojo Map'
          },
        })
        .state('start-dojo', {
          url: '/start-dojo',
          redirectTo: 'start-dojo.champion',
          template: '<cd-start-dojo current-user="currentUser" ></cd-start-dojo>',
          params: {
            referer: 'start-dojo',
            pageTitle: 'Start a Dojo'
          },
          resolve: {
            currentUser: resolves.loggedInUser
          },
          controller: function (currentUser, $scope) {
            $scope.currentUser = currentUser.data;
          }
        })
        .state('start-dojo.champion', {
          url: '/champion',
          parent: 'start-dojo',
          template: '<cd-sad-champion ' +
           'champion="$ctrl.viewData.champion" class="cd-sidebar__content--padded"></cd-sad-champion>',
          params: {
            referer: 'start-dojo',
            pageTitle: 'Start a Dojo'
          }
        })
        .state('start-dojo.information', {
          url: '/information',
          parent: 'start-dojo',
          template: '<cd-sad-information ' +
          'dojo="$ctrl.viewData.dojo" class="cd-sidebar__content--padded"></cd-sad-information>',
          params: {
            referer: 'start-dojo',
            pageTitle: 'Start a Dojo'
          }
        })
        .state('start-dojo.venue', {
          url: '/venue',
          parent: 'start-dojo',
          template: '<cd-sad-venue ' +
            'venue="$ctrl.viewData.venue" gmap="gmap" class="cd-sidebar__content--padded" ></cd-sad-venue>',
          resolve: {
            gmap: gmap
          },
          controller: function ($scope, gmap) {
            $scope.gmap = gmap;
          },
          params: {
            referer: 'start-dojo',
            pageTitle: 'Start a Dojo'
          }
        })
        .state('start-dojo.team', {
          url: '/team',
          parent: 'start-dojo',
          template: '<cd-sad-team ' +
          'team="$ctrl.viewData.team" dojo="$ctrl.viewData.dojo" class="cd-sidebar__content--padded"></cd-sad-team>',
          params: {
            referer: 'start-dojo',
            pageTitle: 'Start a Dojo'
          }
        })
        .state('start-dojo.charter', {
          url: '/charter',
          parent: 'start-dojo',
          template: '<cd-sad-charter ' +
          'charter="$ctrl.viewData.charter" user="$ctrl.user" class="cd-sidebar__content--padded"></cd-sad-charter>',
          params: {
            referer: 'start-dojo',
            pageTitle: 'Start a Dojo'
          }
        })
        .state('start-dojo.review', {
          url: '/review',
          parent: 'start-dojo',
          template: '<cd-sad-review ' +
          'application="$ctrl.viewData" class="cd-sidebar__content--padded" ></cd-sad-review>',
          params: {
            referer: 'start-dojo',
            pageTitle: 'Start a Dojo'
          }
        })
        // .state("start-dojo", {
        //   url: "/start-dojo",
        //   templateUrl: '/dojos/template/start-dojo-wizard/wizard',
        //   params:{
        //     referer: 'start-dojo',
        //     pageTitle: 'Start a Dojo'
        //   },
        //   resolve: {
        //     gmap: gmap
        //   },
        //   controller: 'start-dojo-wizard-controller'
        // })
        .state("terms-and-conditions", {
          url: "/terms-and-conditions",
          templateUrl: '/templates/terms-and-conditions',
          controller: 'terms-and-conditions-controller',
          params: {
            pageTitle: 'Terms & Conditions',
          }
        })
        .state("privacy-statement", {
          url: "/privacy-statement",
          templateUrl: '/templates/privacy-statement',
          controller: 'privacy-statement-controller',
          params: {
            pageTitle: 'Privacy Statement',
          }
        })
        .state('charter',{
          url: '/charter',
          template: '<cd-charter></cd-charter>',
          params: {
            pageTitle: 'Charter',
          }
        })
        // TODO: ask Daniel : keep 2 pages & differenciate with content/no-signup or one for both ?
        .state('charter-page', {
          url: '/charter',
          parent: 'dashboard',
          template: '<cd-charter></cd-charter>',
          params: {
            pageTitle: 'Charter',
          }
        })
        .state('approve-invite-ninja', {
          url:'/approve_invite_ninja/:parentProfileId/:inviteTokenId',
          parent: 'dashboard',
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
          url:'/accept_session_invitation/:ticketId/:invitedUserId',
          parent: 'dashboard',
          controller:'accept-session-invite-controller',
          templateUrl: '/dojos/template/events/accept-session-invite',
          resolve: {
            currentUser: resolves.loggedInUser
          }
        })
        .state('cancel-session-invite', {
            url:'/cancel_session_invitation/:eventId/:applicationId',
            parent: 'dashboard',
            controller:'cancel-session-invite-controller',
            templateUrl:'/dojos/template/events/cancel-session-invite',
            resolve: {
                currentUser: resolves.loggedInUser
            }
        })
        .state("accept-dojo-user-invitation", {
          url: "/accept_dojo_user_invitation/:dojoId/:userInviteToken",
          parent: 'dashboard',
          templateUrl: '/dojos/template/accept-dojo-user-invitation',
          controller: 'accept-dojo-user-invitation-controller'
        })
        .state("accept-dojo-user-request", {
          url: "/accept_dojo_user_request/:userId/:userInviteToken",
          parent: 'dashboard',
          templateUrl: '/dojos/template/accept-dojo-user-request',
          controller: 'accept-dojo-user-request-controller'
        })
        .state('my-children', {
          url: '/children',
          parent: 'dashboard',
          templateUrl: '/profiles/template/my-children',
          controller: 'my-children-controller',
          resolve: {
            ownProfile: resolves.ownProfile
          }
        })
        .state('my-children.add', {
          url: '/add',
          template: '<cd-add-child parent-profile-data="parentProfileData"></cd-add-child>',
          controller: ['$scope', 'ownProfile', function ($scope, ownProfile) {
            $scope.parentProfileData = ownProfile;
          }]
        })
        .state('my-children.child', {
          url: '/:id',
          template: '<cd-child-card parent-profile-data="parentProfileData"></cd-child-card>',
          controller: ['$scope', 'ownProfile', function ($scope, ownProfile) {
            $scope.parentProfileData = ownProfile.data;
          }]
        })
        .state('add-child',{
          url: "/profile/child/add/:userType/:parentId",
          parent: 'dashboard',
          templateUrl: '/directives/tpl/user/cd-profile/edit',
          resolve: {
            profile: resolves.profile,
            loggedInUser: resolves.loggedInUser,
            usersDojos: resolves.usersDojos,
            hiddenFields: resolves.hiddenFields,
            initUserTypes: resolves.initUserTypes,
            championsForUser: resolves.championsForUser,
            parentsForUser: resolves.parentsForUser,
            badgeCategories: resolves.badgeCategories,
            dojoAdminsForUser: resolves.dojoAdminsForUser
          },
          controller: 'user-profile-controller'
        })
        .state('accept-child-invite',{
          url: '/accept_parent_guardian_request/:childProfileId/:inviteToken',
          parent: 'dashboard',
          controller: 'accept-child-controller',
          templateUrl: '/profiles/template/accept-child-invite'
        })
        .state('edit-user-profile', {
          url:'/profile/:userId/edit?referer&eventId',
          parent: 'dashboard',
          controller: 'user-profile-controller',
          resolve: {
            profile: resolves.profile,
            loggedInUser: resolves.loggedInUser,
            hiddenFields: resolves.hiddenFields,
            championsForUser: resolves.championsForUser,
            parentsForUser: resolves.parentsForUser,
            badgeCategories: resolves.badgeCategories,
            dojoAdminsForUser: resolves.dojoAdminsForUser,
            usersDojos: resolves.usersDojos,
            initUserTypes: resolves.initUserTypes
          },
          params: {
            showBannerMessage: null,
            referer: null,
            eventId: null
          },
          templateUrl: '/directives/tpl/user/cd-profile/edit'
        })
        .state("my-profile", {
          url: '/profile?public',
          templateUrl: '/directives/tpl/user/cd-profile/view',
          resolve: {
            profile: resolves.ownProfile,
            loggedInUser: resolves.loggedInUser,
            hiddenFields: resolves.hiddenFields,
            championsForUser: resolves.championsForLoggedInUser,
            parentsForUser: resolves.parentsForLoggedInUser,
            badgeCategories: resolves.badgeCategories,
            dojoAdminsForUser: resolves.dojoAdminsForLoggedInUser,
            usersDojos: resolves.usersDojos,
            initUserTypes: resolves.initUserTypes
          },
          controller: 'user-profile-controller',
          params: {
            pageTitle: 'Profile'
          }
        })
        .state("connect-lms", {
          url: '/profile/lms',
          parent: 'dashboard',
          template: '<cd-lms class="row"></cd-lms>',
          resolve: {
            profile: resolves.ownProfile,
            loggedInUser: resolves.loggedInUser,
            initUserTypes: resolves.initUserTypes
          },
          controller: function ($scope, profile, loggedInUser, initUserTypes) {
            $scope.profile = profile;
            $scope.loggedInUser = loggedInUser;
            $scope.initUserTypes = initUserTypes;
          },
          params: {
            pageTitle: 'Access our e-learning modules'
          }
        })
        .state("user-profile", {
          url: "/profile/:userId?public",
          templateUrl: '/directives/tpl/user/cd-profile/view',
          resolve: {
            profile: resolves.profile,
            loggedInUser: resolves.loggedInUser,
            hiddenFields: resolves.hiddenFields,
            championsForUser: resolves.championsForUser,
            parentsForUser: resolves.parentsForUser,
            badgeCategories: resolves.badgeCategories,
            dojoAdminsForUser: resolves.dojoAdminsForUser,
            usersDojos: resolves.usersDojos,
            initUserTypes: resolves.initUserTypes
          },
          controller: 'user-profile-controller',
          params: {
            pageTitle: 'Profile',
          }
        })
        .state('badges-dashboard', {
          url:'/badges',
          controller:'badges-dashboard-controller',
          template: '<cd-badges></cd-badges>',
          params: {
            pageTitle: 'Badges',
          }
        })
        .state('accept-badge', {
          url:'/badges/accept/:userId/:badgeSlug',
          parent: 'dashboard',
          controller:'accept-badge-controller',
          params: {
            pageTitle: 'Accept Badge'
          },
          templateUrl: '/dojos/template/badges/accept'
        })
        .state('poll-stats', {
          url:'/poll/:pollId',
          template: '<cd-poll></cd-poll>',
          controller: function($scope, gmap){
            $scope.gmap = gmap;
          },
          params: {
            pageTitle: 'Poll stats',
          },
          resolve: {
            gmap: gmap
          }
        })
        .state('fill-poll', {
          url:'/poll/:pollId/dojo/:dojoId',
          template: '<cd-poll></cd-poll>',
          controller: function($scope, gmap){
            $scope.gmap = gmap;
          },
          params: {
            pageTitle: 'Poll',
          },
          resolve: {
            gmap: gmap
          }
        })
        .state('error-404-no-headers', {
          url:'/404',
          templateUrl: '/errors/template/404_no_headers',
          params: {
            pageTitle: 'Page not found',
          }
        });
      $urlRouterProvider.when('', '/');
      $urlRouterProvider.when('/register', '/register/user');
      $urlRouterProvider.otherwise(function ($injector, $location) {
          var $state = $injector.get('$state');
          var $window = $injector.get('$window');
          var url = $location.url();
          if ( url.indexOf('dashboard') > -1  ) {
            $window.location.href = url.replace('/dashboard', '');
          }else{
            $state.go('error-404-no-headers');
          }
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
    .config(['AnalyticsProvider', '$provide', function(AnalyticsProvider, $provide){
      //check if exists or exclude (eg: running tests)
      if (window.zenConf && window.zenConf.googleAnalytics) {
        AnalyticsProvider.setAccount({
          tracker: window.zenConf.googleAnalytics,
        });
        AnalyticsProvider.setDomainName('none');
        AnalyticsProvider.trackUrlParams(true);
        AnalyticsProvider.setPageEvent('$stateChangeSuccess');

        $provide.decorator('ngClickDirective', ['$delegate','Analytics', '$state',
         function ($delegate, Analytics, $state) {
          var originalCompile = $delegate[0].compile;
          $delegate[0].compile = function() {
            var originalLink = originalCompile.apply(this, arguments);
            var action = 'click';
            return function postLink(scope, element, attr) {
              element.bind(action, {attrs: attr}, function(event) {
                var data = !_.isUndefined(event.data.attrs['data-name'])? event.data.attrs['data-name']:
                  !_.isUndefined(event.data.attrs['aria-label']) ? event.data.attrs['aria-label'] :
                  !_.isEmpty(event.target.name) ? event.target.name : $(event.target.lastChild).text();
                Analytics.trackEvent($state.current.name, action, data);
              });
              return originalLink.apply(this, arguments);
            };
          };
          return $delegate;
        }]);
      }
    }])
    .config(['$sceDelegateProvider', function ($sceDelegateProvider) {
      $sceDelegateProvider.resourceUrlWhitelist([
        // Allow same origin resource loads.
        'self',
        // Allow loading from our assets domain.  Notice the difference between * and **.
        'https://s3-eu-west-1.amazonaws.com/zen-dojo-images/**'
      ]);
    }])
    .run(['$window', '$cookieStore', 'tmhDynamicLocale', 'Analytics', function ($window, $cookieStore, tmhDynamicLocale, Analytics) {
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
    .run(['$rootScope', '$filter', '$state', 'embedder', '$cookieStore', '$document', 'verifyProfileComplete', 'alertService', '$translate', '$location',
     function($rootScope, $filter, $state, embedder, $cookieStore, $document, verifyProfileComplete, alertService, $translate, $location){
      // TODO : remove after 2 months (dopen on 26/10/2016), legacy localStorage that needs to be cleaned
      delete localStorage.urlDojoSlug;
      delete localStorage.eventId;
      delete localStorage.joinDojo;

      // Override $translate.instant so it falls back to en_US, then the original key when no result
      var originalTranslateInstant = $translate.instant;
      $translate.instant = function (key) {
        var translation = originalTranslateInstant.apply($translate, arguments);
        if (!translation) {
          var args = Array.prototype.slice.apply(arguments); // Needed so we can modify the arguments
          args[3] = 'en_US'; // The forceLanguage argument
          translation = originalTranslateInstant.apply($translate, args);
        }
        return translation || key;
      };

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (toState.redirectTo) {
          event.preventDefault();
          $state.go(toState.redirectTo, toParams);
        }
      });

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if(!$cookieStore.get('verifyProfileComplete') && toState.parent === 'dashboard' ) {
          if(toState.name !== 'edit-user-profile') {
            verifyProfileComplete().then(function (verifyProfileResult) {
              if(!verifyProfileResult.complete) {
                $state.go('edit-user-profile', {
                  showBannerMessage: true,
                  userId: verifyProfileResult.userId,
                  referer: $location.url()
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

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        if (embedder.isEmbedded(fromState)) {
          var url = $state.href(toState, toParams);
          window.open(url, '_blank');
          event.preventDefault();
        }
      });

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
    .factory('verifyProfileComplete', ['cdUsersService', 'auth', '$q', function (cdUsersService, auth, $q) {
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
    }])
    .run(['Idle', function (Idle){
      Idle.watch();
    }])
    .controller('cdDashboardCtrl', ['$scope', '$uibModal', '$cookieStore', '$window', 'Idle', 'auth', function ($scope, $uibModal, $cookieStore, $window, Idle, auth) {
      $scope.$on('IdleTimeout', function() {
        //session timeout
        $cookieStore.remove('verifyProfileComplete');
        $cookieStore.remove('canViewYouthForums');
        auth.logout(function(data){
          $window.location.href = '/'
        })
      });
    }]);
})();
