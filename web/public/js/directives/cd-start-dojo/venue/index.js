;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSadVenue', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/venue/',
      bindings : {
        gmap: '=?',
        venue: '=',
        tabHeader: '=',
        displayOnly: '<'
      },
      //TODO : dep injection array
      controller: function ($scope, $translate, utilsService, cdDojoService, Geocoder, alertService) {
        var ctrl = this;
        ctrl.venueTypes = [
          { id: 'office',
            name: $translate.instant('Corporate Office')
          },
          { id: 'public_space',
            name: $translate.instant('Community Centre or public civic space')
          },
          { id: 'tech_hub',
            name: $translate.instant('Co-working space or tech hub')
          },
          { id: 'library',
            name: $translate.instant('Library')
          },
          { id: 'maker_space',
            name: $translate.instant('Maker Space')
          },
          { id: 'school',
            name: $translate.instant('School')
          },
          { id: 'university',
            name: $translate.instant('University')
          },
          { id: 'other',
            name: $translate.instant('Other (please detail)')
          }
        ];

        ctrl.corporateList = [
          { id: 'accenture',
            name: $translate.instant('Accenture')
          },
          { id: 'salesforce',
            name: $translate.instant('Salesforce')
          },
          { id: 'microsoft',
            name: $translate.instant('Microsoft')
          },
          { id: 'dell',
            name: $translate.instant('Dell')
          },
          { id: 'boi',
            name: $translate.instant('Bank of Ireland')
          },
          { id: 'intel',
            name: $translate.instant('Intel')
          },
          { id: 'symantec',
            name: $translate.instant('Symantec')
          },
          { id: 'oracle',
            name: $translate.instant('Oracle')
          },
          { id: 'murex',
            name: $translate.instant('Murex')
          },
          { id: 'HP',
            name: $translate.instant('HP')
          },
          { id: 'other',
            name: $translate.instant('Other')
          }
        ];

        // Possible enhancement : pick address by coordinates
        ctrl.$onInit = function () {
          ctrl.model = { markers: [] };
        };
      }
    });
}());
