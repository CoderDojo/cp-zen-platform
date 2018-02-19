const Boom = require('boom');

module.exports = (req, reply) => {
  const resp = req.response;
  let statusCode = 200;
  // This only happens because seneca respond with 200 or 500 only
  // We shouldn't need it in other microservices which are properly using the HTTP standard
  if (resp && resp.http$) {
    if (resp.http$.status) statusCode = resp.http$.status;
    if (resp.http$.redirect) return reply.redirect(resp.http$.redirect);
    return reply(Boom.boomify(resp.data, { statusCode }));
  }
  return reply.continue();
};
