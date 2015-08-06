'use strict';


describe('review-champion-application-controller', function() {

    var scope,
        ctrl,
        sandbox,
        $httpBackend,
        services,
        stubs;

    beforeEach(function() {
        sandbox = sinon.sandbox.create();
    })

    beforeEach(angular.mock.module('cpZenPlatform'));

    beforeEach(inject(function(
        $rootScope,
        $controller,
        _$browser_,
        _$httpBackend_,
        _cdDojoService_
    ) {
        $httpBackend = _$httpBackend_;

        // Ref: https://github.com/angular/angular.js/issues/11373
        _$browser_['cookies'] = function() {
            return {};
        }

        scope = $rootScope.$new();

        services = {};
        services.cdDojo = _cdDojoService_;

        stubs = {
            cdDojo: {}
        };
        stubs.cdDojo.loadDojoLead = sandbox.stub(services.cdDojo, 'loadDojoLead');
         stubs.cdDojo.loadDojoLead.yields({
            application: {
                championDetails: {
                    dateOfBirth: '01/01/2015'
                }
            }
        });

        stubs.cdDojo.loadSetupDojoSteps = sandbox.stub(services.cdDojo, 'loadSetupDojoSteps');
        stubs.cdDojo.loadSetupDojoSteps.yields({
            prerequisites:[{
                name:'findTechnicalMentors'
            }]
        });

        ctrl = $controller('review-champion-application-controller', {
            $scope: scope,
            $state: {
                params: {
                    id: 0
                }
            },
            cdDojoService: services.cdDojo
        });
    }));


    afterEach(function() {
        sandbox.restore();
    });


    it('load dojo lead', function() {
        $httpBackend.when('GET', '/locale/data?format=mf&lang=en_US').respond({});
        $httpBackend.expectGET('/locale/data?format=mf&lang=en_US');
        $httpBackend.when('GET', '/locale/data?format=mf&lang=en_IE').respond({});
        $httpBackend.expectGET('/locale/data?format=mf&lang=en_IE');

        scope.$apply();

        var ca = scope.championApplication;

        console.log(ca);

        expect(stubs.cdDojo.loadDojoLead.callCount).to.equal(1);
        expect(ca.dateOfBirth).to.equal('01/01/2015');
        //expect(ca.prerequisites[0].name).to.equal("testName");
    });
});
