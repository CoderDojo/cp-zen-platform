'use strict';


describe('review-champion-application-controller', function() {

    var scope;
    var ctrl;
    var cdDojoService;
    var loadDojoLeadStub;
    var sandbox;
    var $httpBackend;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    })

    beforeEach(angular.mock.module('cpZenPlatform'));


    beforeEach(inject(function(
        $rootScope,
        $controller,
        _$browser_,
        _cdDojoService_,
        _$httpBackend_
    ) {
        $httpBackend = _$httpBackend_;

        // Ref: https://github.com/angular/angular.js/issues/11373
        _$browser_['cookies'] = function() {
            return {};
        }

        scope = $rootScope.$new();

        cdDojoService = _cdDojoService_;
        loadDojoLeadStub = sandbox.stub(cdDojoService, 'loadDojoLead');

        loadDojoLeadStub.yields({
            application: {
                championDetails: {
                    dateOfBirth: '01/01/2015',
                    hasTechnicalMentorsAccess: true,
                    hasVenueAccess: false
                }
            }
        });

        ctrl = $controller('review-champion-application-controller', {
            $scope: scope,
            $state: {
                params: {
                    id: 0
                }
            },
            cdDojoService: cdDojoService
        });
    }));


    afterEach(function() {
        sandbox.restore();
    });


    it('loads dojo lead', function() {
        $httpBackend.when('GET', '/locale/data?format=mf&lang=default').respond({});
        $httpBackend.expectGET('/locale/data?format=mf&lang=default');

        scope.$apply();

        var ca = scope.championApplication;
        expect(loadDojoLeadStub.callCount).to.equal(1);
        expect(ca.dateOfBirth).to.equal('01/01/2015');
        expect(ca.hasTechnicalMentorsAccess).to.equal('Yes');
        expect(ca.hasVenueAccess).to.equal('No');
    });
});
