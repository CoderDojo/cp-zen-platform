const mastermind = require('../mastermind');
const User = require('../models/user');
const Applications = require('../models/application');
const Memberships = require('../models/membership');

const search = params => // eslint-disable-line no-unused-vars
  mastermind([
    // eslint-disable-next-line no-unused-vars
    async (req, reply, cb) => {
      const related = `[${req.query.related}]`;
      const users = await User.search({ ...req.query, related });
      return reply(users).code(200);
    },
  ]);
const remove = params => // eslint-disable-line no-unused-vars
  mastermind([
    async (req, reply, next) => {
      const user = await User.load(req.params.userId, { related: '[profile, children]' });
      req.app.users = [user.id];
      if (req.payload.cascade && user.profile.children && user.profile.children > 0) {
        req.app.users = req.app.users.concat(user.profile.children);
      }
      try {
        await User.delete(req.params.userId, req.payload);
      } catch (e) {
        return next(e);
      }
      return next();
    },
    async (req, reply, next) => {
      await Promise.all(req.app.users.map(async (u) => {
        try {
          await Applications.forUser.delete(u, { soft: req.payload.soft });
        } catch (e) {
          // 404 means the user didn't have any applications.. Which is fine
          if (e.statusCode !== 404) {
            return Promise.reject(e);
          }
          return Promise.resolve();
        }
      }));
      return next();
    },
    async (req, reply) => {
      await Promise.all(req.app.users.map(async (u) => {
        try {
          await Memberships.delete(u, { soft: req.payload.soft });
        } catch (e) {
          // 404 means the user didn't have any membership.. Which is fine
          if (e.statusCode !== 404) {
            return Promise.reject(e);
          }
          return Promise.resolve();
        }
      }));
      return reply().code(204);
    }]);
const load = params => // eslint-disable-line no-unused-vars
  mastermind([
    async (req, reply) => {
      const user = await User.load(req.params.userId, { related: `[${req.query.related}]` });
      return reply(user).code(200);
    },
  ]);
module.exports = {
  search,
  delete: remove,
  load,
};
