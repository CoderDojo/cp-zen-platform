const mastermind = require('../mastermind');
const MembershipRequests = require('../models/membership-request');
const Dojos = require('../models/dojo');
const Users = require('../models/user');
const MembershipNotifications = require('../models/membership-emails');

const request = params => // eslint-disable-line no-unused-vars
  mastermind([
    async (req, reply, next) => {
      const dojoId = req.params.id;
      const userType = req.payload.userType;
      const userId = req.user.user.id;
      req.app.membershipRequest = await MembershipRequests.create(userId, userType, dojoId);
      next();
    },
    async (req, reply) => {
      const dojo = await Dojos.load(req.params.id, { fields: 'id,name,email', related: 'owner' });
      const owner = await Users.load(dojo.owner.userId);
      const { membershipRequest, context } = req.app;
      await MembershipNotifications.sendRequestToJoin(
        context.locality,
        membershipRequest,
        dojo,
        owner,
        req.user.user,
      );
      // It's not possible in Hapijs to respond and continue in the handler
      // That's sad considering the side-loads required to send an email
      reply(req.app.membershipRequest).code(200);
    },
  ]);
module.exports = {
  request,
};
