;(function() {
  'use strict';

  var listOfProgrammingLanguages = {
    restrict: 'E',
    templateUrl: '/directives/tpl/cd-programming-languages-list',
    bindings: {
      programmingLanguages: '<'
    },
    controller: ['cdProgrammingLanguagesService', function (cdProgrammingLanguagesService) {
      var ctrl = this;
      cdProgrammingLanguagesService.get().then(function (data) {
        var programmingLanguagesJSON = data.data;
        _.each(ctrl.programmingLanguages, function (language, index) {
          var lLanguage = _.find(programmingLanguagesJSON, {text: language.text});
          if (!_.isUndefined(lLanguage)) {
            ctrl.programmingLanguages[index].picture = lLanguage.image;
            ctrl.programmingLanguages[index].caption = lLanguage.text;
            ctrl.programmingLanguages[index].href = lLanguage.href;
          }
        });
      });
    }]
  };

angular
  .module('cpZenPlatform')
  .component('programmingLanguagesList', listOfProgrammingLanguages);
}());
