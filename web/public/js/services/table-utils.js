'use strict';

angular.module('cpZenPlatform').factory('tableUtils', function($rootScope) {
  var tableUtils = {};

  tableUtils.calculateSkip = function(pageNo, itemsPerPage) {
    return (pageNo - 1) * itemsPerPage;
  };

  tableUtils.loadPage = function(resetFlag, itemsPerPage, pageNo, filterQuery, sort) {
  	var skip, limit, countQuery={}, config ={};
    
    limit = itemsPerPage;
    var loadPageData = {};

    if(resetFlag){
      loadPageData.pageNo = 1;
      loadPageData.skip = 0;
    } else {
      loadPageData.pageNo = pageNo;
      loadPageData.skip = tableUtils.calculateSkip(pageNo, itemsPerPage);
    }

    config.skip = loadPageData.skip;
    config.limit = limit;

    if(!_.isEmpty(filterQuery)){
      _.extend(config, filterQuery);
      
      countQuery = _.omit(filterQuery, function(value, key, object){
        return _.isNull(value) || _.isUndefined(value) || _.isNaN(value) || value === "";
      });
    
    }
    
    if(!_.isEmpty(sort)){
      config.sort = sort;
    }

    loadPageData.config = config;
    loadPageData.countQuery = countQuery;
    return loadPageData;
  };

  return tableUtils;
});
