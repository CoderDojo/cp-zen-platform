

module.exports = [{
  method: 'GET',
  path: '/dojos/template/{name*}',
  handler(request, reply) {
    reply.view(`dojos/${request.params.name}`, request.app);
  },
}];
