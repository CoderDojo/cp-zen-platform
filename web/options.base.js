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
          '/charter': 1,
          '/my-dojos': 1
        }
      },
      'basic-user': {
        prefixmap: {
          '/charter': 1,
          '/my-dojos': 1
        }
      },
      'mentor': {
        prefixmap: {
          '/charter': 1,
          '/my-dojos': 1
        }
      },
      'champion': {
        prefixmap: {
          '/charter': 1,
          '/my-dojos': 1
        }
      },
      'cdf-admin': {
        prefixmap: {
          '/charter': 1,
          '/my-dojos': 1
        }
      }
    }
  },

  'web-access': {
    prefixlist: [
      '/admin',
      '/charter',
      '/my-dojos'
    ]
  }

};
