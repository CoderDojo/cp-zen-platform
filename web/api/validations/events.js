const queryFields = require('./query');
const Joi = require('joi');

const fields = ['startTime', 'endTime', 'status'];
const query = queryFields(fields);
const definitions = {
  status: Joi.string().valid('draft', 'published', 'canceled'),
  beforeDate: Joi.date()
    .timestamp()
    .raw(),
  afterDate: Joi.date()
    .timestamp()
    .raw(),
  isPublic: Joi.number().valid(0, 1),
  related: Joi.string().valid('sessions', 'sessions.tickets'),
  utcOffset: Joi.number().integer(),
};

const modelDefinitions = {
  name: Joi.string(),
  dojoId: Joi.string().guid(),
  createdBy: Joi.string().guid(),
  type: Joi.string().valid('one-off', 'recurring'),
  description: Joi.string(),
  public: Joi.boolean(),
  // draft status is actually 'saved' string underneath
  status: Joi.string().valid('saved', 'published', 'canceled'),
  recurringType: Joi.string()
    .valid('biweekly', 'weekly')
    .optional(),
  dates: Joi.array().items(
    Joi.object({
      startTime: Joi.date(),
      endTime: Joi.date(),
    })
  ),
  ticketApproval: Joi.boolean().optional(),
  notifyOnApplicant: Joi.boolean().optional(),
  useDojoAddress: Joi.boolean(),
  sendEmails: Joi.boolean(),
  country: Joi.object({
    countryName: Joi.string(),
    countryNumber: Joi.number().integer(),
    continent: Joi.string(),
    alpha2: Joi.string().length(2),
    alpha3: Joi.string().length(3),
  }).optional(),
  city: Joi.alternatives()
    .try(
      Joi.object({
        nameWithHierarchy: Joi.string(),
      }),
      Joi.object({
        toponymName: Joi.string(),
      }),
      Joi.object({
        name: Joi.string(),
      })
    )
    .optional(),
  address: Joi.string(),
  sessions: Joi.array().items(
    Joi.object({
      name: Joi.string(),
      description: Joi.string(),
      tickets: Joi.array().items(
        Joi.object({
          name: Joi.string(),
          type: Joi.string().valid('ninja', 'mentor', 'parent-guardian'),
          quantity: Joi.number().integer(),
        })
      ),
    })
  ),
  newForm: Joi.boolean(),
};

const updateModelDefinitions = {
  ...modelDefinitions,
  id: Joi.string().guid(),
  sessions: Joi.array().items(
    Joi.object({
      id: Joi.string()
        .guid()
        .optional(),
      eventId: Joi.string()
        .guid()
        .optional(),
      status: Joi.string().optional(),
      name: Joi.string(),
      description: Joi.string(),
      tickets: Joi.array().items(
        Joi.object({
          id: Joi.string()
            .guid()
            .optional(),
          sessionId: Joi.string()
            .guid()
            .optional(),
          deleted: Joi.number()
            .integer()
            .optional(),
          approvedApplications: Joi.number()
            .integer()
            .optional(),
          name: Joi.string(),
          type: Joi.string().valid('ninja', 'mentor', 'parent-guardian'),
          quantity: Joi.number().integer(),
        })
      ),
    })
  ),
};

module.exports = {
  base: query.base,
  definitions,
  fields,
  modelDefinitions,
  updateModelDefinitions,
};
