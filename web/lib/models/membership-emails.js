const Email = require('./email');

const port = process.env.ZEN_PORT || 8000;
const host = process.env.ZEN_HOSTNAME || 'localhost';
const protocol = process.env.ZEN_PROTOCOL || 'http';

class MembershipEmail extends Email {
  sendRequestToJoin(locale, membership, dojo, owner, user) {
    const templateName = 'user-request-to-join';
    this.post({
      language: locale,
      templateName,
      templateOptions: {
        dojoName: dojo.name,
        userType: membership.userType,
        name: user.name,
        email: user.email,
        acceptLink: `${protocol}://${host}:${port}/dashboard/dojos/${
          dojo.id
        }/join-requests/${membership.id}/status/accept`,
        refuseLink: `${protocol}://${host}:${port}/dashboard/dojos/${
          dojo.id
        }/join-requests/${membership.id}/status/refuse`,
        year: new Date().getFullYear(),
      },
      emailOptions: {
        to: `${owner.email}, ${dojo.email}`,
        from: `"${dojo.name}" <${this.defaultAddress}>`,
      },
    });
  }
}
module.exports = new MembershipEmail({
  headers: { 'x-smtpapi': { category: ['clubs-service'] } },
});
