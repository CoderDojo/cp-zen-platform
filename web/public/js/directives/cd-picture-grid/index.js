(function () {
  'use strict';

  angular.module('cpZenPlatform').component('cdPictureGrid', {
    bindings: {
      items: '<',
      actions: '<',
      multipleSelection: '<'
    },
    templateUrl: '/directives/tpl/cd-picture-grid',
    controller: function ($element) {
      var ctrl = this;
      ctrl.showActionBar = false;
      ctrl.selectedItems = [];
      var gridItems = null;
      var selectedClass = 'cd-picture-grid__item--selected';

      function clearSelection () {
        gridItems = gridItems || $element.find('.cd-picture-grid__item'); // so we only query the DOM once
        gridItems.removeClass(selectedClass);
        ctrl.selectedItems = [];
      }

      ctrl.handleSelection = function (e, item) {
        if (ctrl.actions) {
          e.preventDefault();
          var $el = $(e.currentTarget);
          if (ctrl.multipleSelection !== true && ctrl.selectedItems.length > 0) {
            clearSelection();
          }
          if ($el.hasClass(selectedClass)) {
            $el.removeClass(selectedClass);
            ctrl.selectedItems.splice(ctrl.selectedItems.indexOf(item), 1);
          } else {
            $el.addClass(selectedClass);
            ctrl.selectedItems.push(item);
          }
          ctrl.showActionBar = ctrl.selectedItems.length > 0;
        }
      };

      ctrl.onChanges = function (changes) {
        if (changes.items) {
          clearSelection();
        }
      };
    }
  });
})();
