const chai = require('chai');
const lab = require('lab').script();
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const sitemap = require('sitemap');
const fn = require('../../../web/lib/plugins/sitemap');

const expect = chai.expect;
chai.use(sinonChai);
exports.lab = lab;
lab.describe('sitemap', () => {
  const sandbox = sinon.sandbox.create();
  const serverStub = {
    route: sandbox.stub(),
    expose: sandbox.stub(),
    seneca: {
      act: sandbox.stub(),
    },
    app: {
      hostUid: 'uid',
    },
    log: sandbox.stub(),
  };
  const sitemapCreateSpy = sandbox.spy(sitemap, 'createSitemap');
  const nextStub = sandbox.stub();
  const dojoList = [
    { urlSlug: 'fr/Lyon' },
    { urlSlug: 'ie/Dublin' },
  ];
  const host = 'http://127.0.0.1:8000';
  const staticUrls = [
    {
      url: `${host}/charter`,
      changefreq: 'monthly',
      priority: 0.1,
    },
    {
      url: `${host}/terms-and-conditions`,
      changefreq: 'monthly',
      priority: 0.1,
    },
    {
      url: `${host}/privacy-statement`,
      changefreq: 'monthly',
      priority: 0.1,
    },
    {
      url: `${host}/badges`,
      changefreq: 'weekly',
      priority: 0.3,
    },
  ];
  let refresh;
  let fetch;

  lab.beforeEach((done) => {
    sandbox.reset();
    done();
  });

  lab.test('should expose refresh and fetch', (done) => {
    fn.register(serverStub, null, nextStub);
    expect(serverStub.expose).to.have.been
      .calledWith('refresh', sinon.match.func);
    refresh = serverStub.expose.getCall(0).args[1];
    expect(serverStub.expose).to.have.been
      .calledWith('fetch', sinon.match.func);
    fetch = serverStub.expose.getCall(1).args[1];
    expect(nextStub).to.have.been.calledOnce;
    done();
  });

  lab.test('should register the route', (done) => {
    fn.register(serverStub, null, nextStub);
    expect(serverStub.route).to.have.been.calledOnce;
    expect(serverStub.route).to.have.been.calledWith({
      method: 'GET',
      path: '/sitemap.xml',
      handler: sinon.match.func,
    });
    expect(nextStub).to.have.been.calledOnce;
    done();
  });

  lab.describe('refresh', () => {
    lab.test('should prepare the sitemap XML with dojo data', (done) => {
      serverStub.seneca.act.callsFake((params, cb) => cb(null, dojoList));
      refresh();
      expect(serverStub.seneca.act).to.have.been.calledOnce;
      expect(serverStub.seneca.act).to.have.been.calledWith({
        role: 'cd-dojos',
        cmd: 'list',
        entity: 'dojo',
        query: { verified: 1, stage: { ne$: 4 }, deleted: 0, fields$: ['url_slug'] },
      });
      expect(sitemapCreateSpy).to.have.been.calledOnce;
      expect(sitemapCreateSpy).to.have.been.calledWith({
        hostname: sinon.match.string,
        cacheTime: 0,
        urls: [
          {
            url: sinon.match('/dojos/fr/Lyon'),
            changefreq: 'weekly',
            priority: 0.5,
          },
          {
            url: sinon.match('/dojos/ie/Dublin'),
            changefreq: 'weekly',
            priority: 0.5,
          },
        ].concat(staticUrls),
      });
      done();
    });

    lab.test('should set static Urls if no Dojos nor error', (done) => {
      serverStub.seneca.act.callsFake((params, cb) => cb(null, []));
      refresh();
      expect(serverStub.seneca.act).to.have.been.calledOnce;
      expect(serverStub.seneca.act).to.have.been.calledWith({
        role: 'cd-dojos',
        cmd: 'list',
        entity: 'dojo',
        query: { verified: 1, stage: { ne$: 4 }, deleted: 0, fields$: ['url_slug'] },
      });
      expect(sitemapCreateSpy).to.have.been.calledOnce;
      expect(sitemapCreateSpy).to.have.been.calledWith({
        hostname: sinon.match.string,
        cacheTime: 0,
        urls: staticUrls,
      });
      done();
    });

    lab.test('should call the logger on error', (done) => {
      const err = new Error('dubidu');
      serverStub.seneca.act.callsFake((params, cb) => cb(err));
      refresh();
      expect(serverStub.seneca.act).to.have.been.calledOnce;
      expect(serverStub.seneca.act).to.have.been.calledWith({
        role: 'cd-dojos',
        cmd: 'list',
        entity: 'dojo',
        query: { verified: 1, stage: { ne$: 4 }, deleted: 0, fields$: ['url_slug'] },
      });
      expect(serverStub.log).to.have.been.calledOnce;
      expect(sitemapCreateSpy).to.not.have.been.called;
      done();
    });

    lab.test('should call cb when provided at the end', (done) => {
      const cbStub = sandbox.stub();
      serverStub.seneca.act.callsFake((params, cb) => cb(null, dojoList));
      refresh(cbStub);
      expect(serverStub.seneca.act).to.have.been.calledOnce;
      expect(serverStub.seneca.act).to.have.been.calledWith({
        role: 'cd-dojos',
        cmd: 'list',
        entity: 'dojo',
        query: { verified: 1, stage: { ne$: 4 }, deleted: 0, fields$: ['url_slug'] },
      });
      expect(sitemapCreateSpy).to.have.been.calledOnce;
      expect(sitemapCreateSpy).to.have.been.calledWith({
        hostname: sinon.match.string,
        cacheTime: 0,
        urls: [
          {
            url: sinon.match('/dojos/fr/Lyon'),
            changefreq: 'weekly',
            priority: 0.5,
          },
          {
            url: sinon.match('/dojos/ie/Dublin'),
            changefreq: 'weekly',
            priority: 0.5,
          },
        ].concat(staticUrls),
      });
      expect(cbStub).to.have.been.calledOnce;
      done();
    });
  });

  lab.describe('fetch', () => {
    lab.test('should call refresh until there is no error', (done) => {
      const err = new Error('dubidu');
      const assert = () => {
        expect(serverStub.seneca.act).to.have.been.calledThrice;
        done();
      };
      serverStub.seneca.act.onCall(0).callsFake((params, cb) => cb(err));
      serverStub.seneca.act.onCall(1).callsFake((params, cb) => cb(err));
      serverStub.seneca.act.onCall(2).callsFake((params, cb) => { cb(null); assert(); });
      fetch();
    });
  });
});
