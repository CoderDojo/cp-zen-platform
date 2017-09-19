

module.exports = [{
  method: 'GET',
  path: '/profiles/template/{name*}',
  handler(request, reply) {
    reply.view(`profiles/${request.params.name}`, request.app);
  },
}];
