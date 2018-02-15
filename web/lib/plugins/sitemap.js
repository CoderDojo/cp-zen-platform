const sitemap = require('sitemap');

exports.register = (server, options, next) => {
  const port = process.env.PORT || 8000;
  const host = process.env.HOSTNAME || '127.0.0.1';
  const protocol = process.env.PROTOCOL || 'http';
  const hostWithPort = `${protocol}://${host}:${port}`;
  let currentSitemap;
  const skeleton = {
    hostname: hostWithPort,
    cacheTime: 0, // We manage the reset of the cache manually
    urls: [],
  };
  const staticUrls = [
    {
      url: '/charter',
      changefreq: 'monthly',
      priority: 0.1,
    },
    {
      url: '/terms-and-conditions',
      changefreq: 'monthly',
      priority: 0.1,
    },
    {
      url: '/privacy-statement',
      changefreq: 'monthly',
      priority: 0.1,
    },
    {
      url: '/badges',
      changefreq: 'weekly',
      priority: 0.3,
    },
  ];

  // Route handler for /sitemap.xml
  const handler = (req, reply) => reply(currentSitemap).header('Content-Type', 'application/xml');

  // format a Dojo into a sitemap url
  const dojoToSitemapUrl = ({ urlSlug }) => ({
    url: `/dojos/${urlSlug}`,
    changefreq: 'weekly',
    priority: 0.5,
  });
  // Reload the list of Dojo and format it as XML
  const refresh = (cb) => {
    const query = { verified: 1, stage: { ne$: 4 }, deleted: 0, fields$: ['url_slug'] };
    server.seneca.act({ role: 'cd-dojos', entity: 'dojo', cmd: 'list', query },
      (err, res) => {
        if (err) {
          server.log(['error', 500], {
            status: 500,
            host: server.app.hostUid,
            params: query,
            error: err,
          }, Date.now());
        } else {
          const urls = res && res.length ? res.map(dojoToSitemapUrl) : [];
          currentSitemap = sitemap
            .createSitemap(Object.assign({}, skeleton, { urls: urls.concat(staticUrls) }))
            .toString();
        }
        if (cb) return cb(err);
      });
  };
  // Tries to load the sitemap until it has a non-erronous result
  const fetch = () => {
    const cb = (err) => {
      if (err) {
        setImmediate(() => fetch(cb));
      }
    };
    if (server.seneca) {
      refresh(cb);
    }
  };

  server.route({
    method: 'GET',
    path: '/sitemap.xml',
    handler,
  });
  server.expose('refresh', refresh);
  server.expose('fetch', fetch);

  next();
};

exports.register.attributes = {
  name: 'sitemap',
  dependencies: ['chairo', 'cd-log'],
};
