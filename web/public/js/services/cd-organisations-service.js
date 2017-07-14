'use strict'

function cdOrganisationsService (cdApi, $q) {
  var base = 'organisations';
  return {
    list: function () {
      return cdApi.get(base);
    },
    load: function (orgId) {
      return cdApi.get(base + '/' + orgId);
    },
    create: function (orgName) {
      return cdApi.post(base, {org: {name: orgName}});
    },
    loadUsersOrg: function (query) {
      return cdApi.post('users/organisations', query);
    },
    loadOrgUsers: function (orgId) {
      return cdApi.get(base + '/' + orgId + '/users');
    },
    loadUserOrgs: function (userId) {
      return cdApi.get('user/' + userId + '/organisations');
    },
    createUser: function (orgId, userId) {
      return cdApi.post(base + '/' + orgId + '/users', {userOrg: {orgId: orgId, userId: userId}});
    },
    deleteUser: function (orgId, userId) {
      return cdApi.delete(base + '/' + orgId + '/users/' + userId);
    }
  };
}

angular.module('cpZenPlatform')
  .service('cdOrganisationsService', ['cdApi', '$q', cdOrganisationsService]);
