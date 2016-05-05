'use strict'

function cdTheme() {
  var colors = {
    green: '#61C93F',
    blue: '#2C9CFB',
    yellow: '#FBCC33'
  };
  return {
    colors: colors
  };
}

angular.module('cpZenPlatform')
  .service('cdTheme', [cdTheme]);
