
var util = require('util');

describe('review-champion-application-controller', function() {

  var scope,
      ctrl;

  beforeEach(angular.mock.module('cpZenPlatform'));

  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('review-champion-application-controller', {$scope: scope, $state:{params:{id:0}}, cdDojoService: require('./stubs/cd-dojos.js')() });
  }));

  it('happy', function(){

    var ca = scope.championApplication;
    // console.log('championApplication: ' + util.inspect(ca));

    expect(ca.dateOfBirth).to.equal('01/01/2015');
    expect(ca.hasTechnicalMentorsAccess).to.equal('Yes');
    expect(ca.hasVenueAccess).to.equal('No');
  });
});
