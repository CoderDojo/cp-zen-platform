'use strict';

describe('stats-controller', function() {

    var scope,
        ctrl,
        sandbox,
        $httpBackend,
        services, // contains refs to implementations
        stubs, // contains stubs of these
        expected;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();

        fixture.setBase('test/fixtures')
        expected = fixture.load('countries.json');
    })

    beforeEach(angular.mock.module('ngCookies', function ($provide) {
        $provide.value("$cookies", function(){});
    }));

    beforeEach(angular.mock.module('cpZenPlatform'));

    beforeEach(inject(function(
        $rootScope,
        $controller,
        _$browser_,
        _$httpBackend_,
        _alertService_,
        _auth_,
        _cdAgreementsService_,
        _cdDojoService_
    ) {
        $httpBackend = _$httpBackend_;

        // Ref: https://github.com/angular/angular.js/issues/11373
        _$browser_['cookies'] = function() {
            return {};
        };

        scope = $rootScope.$new();

        // for each service, find all functions and stub them
        var map = {
            alert: _alertService_,
            auth : _auth_,
            cdAgreements: _cdAgreementsService_,
            cdDojo: _cdDojoService_
        };
        var res = stubAll({map: map, sandbox: sandbox}); // stubAll() defined in util/globals.js
        services = res.services;
        stubs = res.stubs;
        // specific:
        stubs.cdAgreements.count.yields(7);
        stubs.cdDojo.getStats.yields(expected.stats);
        stubs.cdDojo.getContinentCodes.yields(expected.continent_codes);

        ctrl = $controller('stats-controller', {
            $scope: scope,
            alertService: services.alert,
            auth: services.auth,
            cdAgreementsService: services.cdAgreements,
            cdDojoService: services.cdDojo
        });
    }));

    afterEach(function() {
        sandbox.restore();
    });

    it('get stats', function() {
        $httpBackend.when('GET', '/locale/data?format=mf&lang=en_US').respond({});
        $httpBackend.expectGET('/locale/data?format=mf&lang=en_US');
        $httpBackend.when('GET', '/locale/data?format=mf&lang=en_IE').respond({});
        $httpBackend.expectGET('/locale/data?format=mf&lang=en_IE');
        $httpBackend.when('GET', '/auth/instance').respond({});
        $httpBackend.expectGET('/auth/instance');

        scope.$apply();

        // verify calls
        expect(stubs.alert.showError.callCount).to.equal(0);
        expect(stubs.auth.get_loggedin_user.callCount).to.equal(1);
        expect(stubs.cdAgreements.count.callCount).to.equal(1);
        expect(stubs.cdDojo.getStats.callCount).to.equal(1);
        expect(stubs.cdDojo.getContinentCodes.callCount).to.equal(1);

        // verify scope changes
        expect(scope.count).to.be.equal(7);
        expect(scope.dojos).to.deep.equal(expected.stats);
        expect(scope.totals).to.deep.equal(expected.totals);
        expect(scope.continentMap).to.deep.equal(_.invert(expected.continent_codes));
    });
});
