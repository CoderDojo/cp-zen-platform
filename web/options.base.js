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
          '/dashboard': 1
        }
      },
      'mentor': {
        prefixmap: {
          '/dashboard': 1
        }
      },
      'champion': {
        prefixmap: {
          '/dashboard': 1
        }
      },
      'cdf-admin': {
        prefixmap: {
          '/dashboard': 1
        }
      }
    }
  },

  'web-access': {
    prefixlist: [
      '/dashboard',
      '/admin'
    ]
  }

};
