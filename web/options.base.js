module.exports = {

  'main': {
    'timeout': 66666
  },

  'bodyparser': {
    'json': {
      'limit': '10mb'
    }
  },

  'user-roles': {
    roles: {
      'admin': {
        prefixmap: {
          '/dashboard': 1
        }
      },
      'manager': {
        prefixmap: {
          '/dashboard': 1
        }
      },
      'basic-user': {
        prefixmap: {
          '/dashboard/dojo-list': 1,
          '/dashboard/my-dojos': 1,
          '/dashboard/start-dojo': 1
        }
      },
      'cdf-admin': {
        prefixmap: {
          '/dashboard/dojo-list': 1,
          '/dashboard/my-dojos': 1,
          '/dashboard/start-dojo': 1,
          '/dashboard/manage-dojos': 1,
          '/dashboard/stats': 1
        }
      }
    }
  },

  //All of these routes are restricted.
  //Routes below can be unrestricted by adding them to the relevant user role above
  'web-access': {
    prefixlist: [
      '/dashboard/dojo-list',
      '/dashboard/my-dojos',
      '/dashboard/start-dojo',
      '/dashboard/manage-dojos',
      '/dashboard/stats',
      '/admin'
    ]
  }

};
