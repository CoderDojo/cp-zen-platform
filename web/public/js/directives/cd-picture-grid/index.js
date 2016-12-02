(function () {
  'use strict';

  angular.module('cpZenPlatform').component('cdPictureGrid', {
    bindings: {
      items: '<',
      actions: '<',
      multipleSelection: '<',
      selectedItems: '=?',
      wideCard: '<',
      onSelection: '<',
      itemIcon: '@',
      itemIconColor: '@',
      showItemIcons: '<',
      imageZoom: '<',
      align: '@',
      size: '@'
    },
    templateUrl: '/directives/tpl/cd-picture-grid',
    controller: function ($element) {
      var ctrl = this;
      ctrl.showItemIcons = ctrl.showItemIcons !== false; // default true
      ctrl.showActionBar = false;
      ctrl.selectedItems = [];
      var gridItems = null;
      var selectedClass = 'cd-picture-grid__item--selected';

      function clearSelection () {
        gridItems = gridItems || $element.find('.cd-picture-grid__item'); // so we only query the DOM once
        gridItems.removeClass(selectedClass);
        ctrl.selectedItems = [];
        ctrl.showActionBar = ctrl.selectedItems && ctrl.selectedItems.length > 0;
      }

      ctrl.handleSelection = function (e, item) {
        if (ctrl.actions) {
          e.preventDefault();
          var $el = $(e.currentTarget);
          if ($el.hasClass(selectedClass)) {
            $el.removeClass(selectedClass);
            ctrl.selectedItems.splice(ctrl.selectedItems.indexOf(item), 1);
          } else {
            if (ctrl.multipleSelection !== true && ctrl.selectedItems.length > 0) {
              clearSelection();
            }
            $el.addClass(selectedClass);
            ctrl.selectedItems.push(item);
          }
          ctrl.showActionBar = ctrl.selectedItems.length > 0;
        }
        if (ctrl.onSelection) {
          ctrl.onSelection(e, item);
        }
      };

      ctrl.handleCheckboxChange = function(e, callback) {
        e.stopPropagation();
        e.preventDefault();
        callback(ctrl.selectedItems);
      };

      ctrl.$onChanges = function (changes) {
        if (changes.items) {
          gridItems = undefined;
          clearSelection();
        }
      };
    },
    transclude: true
  });
})();
