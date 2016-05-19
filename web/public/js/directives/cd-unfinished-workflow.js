;(function() {
  'use strict';

function cdUnfinishedWorkflow(AlertBanner, cdDojoService, cdAgreementsService, auth, $translate){
    return {
      restrict: 'E',
      controller: function($scope){
        //  TODO : rebuild inside dashboard as a part of your "unfinished" workflow
        auth.get_loggedin_user_promise().then(function (user) {
          if(user){
            cdDojoService.getUsersDojosPromise({userId: user.id, owner: 1}).then(function(dojoUser){
              cdAgreementsService.loadUserAgreementPromise(user.id).then(function (agreement) {
                if(_.isEmpty(agreement) && !_.isEmpty(dojoUser) ){
                  AlertBanner.publish({
                    type: 'info',
                    message: '<a class="a-no-float" href="/dashboard/charter"  >' + $translate.instant('Please click here to accept the charter') + '</a>',
                    timeCollapse: 8000
                  });
                }
              });
            });
          }
        });
      },
      replace: true
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdUnfinishedWorkflow', ['AlertBanner', 'cdDojoService', 'cdAgreementsService', 'auth', '$translate', cdUnfinishedWorkflow]);

}());
