;(function() {
  'use strict';

// TODO : split with subDirective
// TODO : modify footer to use this
function cdSocialNetwork(){
    return {
      scope: {
        flickr: '=?',
        google: '=?',
        linkedin: '=?',
        facebook: '=?',
        twitter: '=?',
        email: '=?',
        phone: '=?'
      },
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-social-network',
      controller: function ($scope) {
        var cdSN = this;
        var providers = ['flickr', 'google', 'linkedin', 'facebook', 'twitter'];
        var urls = ['', '', '//linkedin.com/', '//facebook.com/', '//twitter.com/'];
        _.each(providers, function (provider, index){
          if ($scope[provider]) {
            this[provider] = $scope[provider];
            if (!_.includes(urls[index], this[provider])) this[provider] = urls[index] + this[provider];
          }
        }.bind(this));
        this.email = $scope.email;
        this.phone = $scope.phone;
        this.empty = [this.email, this.phone, this.flickr, this.linkedin, this.facebook, this.twitter].every(_.isEmpty);

        this.expand = function ($event) {
          cdSN[$event.currentTarget.title + 'Visible'] = !cdSN[$event.currentTarget.title + 'Visible'];
        }
      },
      controllerAs: 'cdSN'
    };
  }

angular
    .module('cpZenPlatform')
    .directive('cdSocialNetwork', [cdSocialNetwork]);

}());
