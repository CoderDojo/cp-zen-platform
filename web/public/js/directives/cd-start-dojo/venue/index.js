;(function() {
  'use strict';
  /* global google */
angular
    .module('cpZenPlatform')
    .component('cdSadVenue', {
      restrict: 'EA',
      templateUrl: '/directives/tpl/cd-start-dojo/venue/',
      bindings : {
        gmap: '=?',
        venue: '='
      },
      controller: ['$translate', 'Geocoder', 'atomicNotifyService', '$scope', '$timeout',
       function ($translate, Geocoder, atomicNotifyService, $scope, $timeout) {
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
              name: 'Accenture'
            },
            { id: 'salesforce',
              name: 'Salesforce'
            },
            { id: 'microsoft',
              name: 'Microsoft'
            },
            { id: 'dell',
              name: 'Dell'
            },
            { id: 'boi',
              name: 'Bank of Ireland'
            },
            { id: 'intel',
              name: 'Intel'
            },
            { id: 'symantec',
              name: 'Symantec'
            },
            { id: 'oracle',
              name: 'Oracle'
            },
            { id: 'murex',
              name: 'Murex'
            },
            { id: 'HP',
              name: 'HP'
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
        ctrl.emptyOtherFields = function () {
          if (ctrl.venue.type !== 'office') {
            delete ctrl.venue.corporate;
            delete ctrl.venue.alternativeCorporate;
          }
          if (ctrl.venue.type !== 'other') {
            delete ctrl.venue.alternativeType;
          }
          if (ctrl.venue.type === 'office' && ctrl.venue.corporate !== 'other') {
            delete ctrl.venue.alternativeCorporate;
          }
        }
        $scope.$on('$destroy', function () {
          validityWatcher();
        });
        ctrl.refreshMap = function () {
          $timeout(function () {
            google.maps.event.trigger(ctrl.model.map, 'resize');
          });
        };
      }]
    });
}());
