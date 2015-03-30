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
          '/admin': 1
        }
      },
      'manager': {
        prefixmap: {
          '/dojo-list': 1,
          '/charter': 1,
          '/my-dojos': 1
        }
      }
    }
  },

  'web-access': {
    prefixlist: [
      '/admin',
      '/dojo-list',
      '/charter',
      '/my-dojos'
    ]
  }

};
