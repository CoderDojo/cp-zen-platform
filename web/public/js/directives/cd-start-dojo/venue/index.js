;(function() {
  'use strict';

angular
    .module('cpZenPlatform')
    .component('cdSadVenue', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/venue/',
      bindings : {
        gmap: '=?',
        venue: '='
      },
      //TODO : dep injection array
      controller: function ($translate, Geocoder, atomicNotifyService, $scope) {
        var ctrl = this;
        ctrl.$onInit = function () {
          ctrl.model = { markers: [] };
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
              name: $translate.instant('Other')
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
        };
        ctrl.displayInfo = function () {
          atomicNotifyService.custom('info',
            $translate.instant('No problem! You can continue filling out the rest of the application, and come back to this when you’ve found a venue.'),
            'fa fa-thumbs-up fa-flip-horizontal', 3000);
        };
        // We don't watch over validity, but over the fact it's touched, so that it refreshes even when the status of validity is the same
        var validityWatcher = $scope.$watchGroup(['$ctrl.venueForm.$pristine', '$ctrl.venueForm.$valid'], function () {
          if (ctrl.venue && !ctrl.venueForm.$pristine) ctrl.venue.formValidity = ctrl.venueForm.$valid;
        });
        $scope.$on('$destroy', function () {
          validityWatcher();
        });
      }
    });
}());
