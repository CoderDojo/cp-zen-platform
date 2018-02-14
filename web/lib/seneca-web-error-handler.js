module.exports = (req, reply) => {
  const resp = req.response;
  let code = 200;
  // This only happens because seneca respond with 200 or 500 only
  // We shouldn't need it in other microservices which are properly using the HTTP standard
  if (resp && resp.http$) {
    if (resp.http$.status) code = resp.http$.status;
    if (resp.http$.redirect) return reply.redirect(resp.http$.redirect);
    return reply(resp.data).code(code);
  }
  return reply(resp).code(code);
};
