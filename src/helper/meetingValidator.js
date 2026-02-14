// validators/meetingValidator.js
import Joi from 'joi';

// Create Meeting Validation Schema
const createMeetingSchema = Joi.object({
    topic: Joi.string().required().min(1).max(200).messages({
        'string.empty': 'Topic is required',
        'string.min': 'Topic must be at least 1 character',
        'string.max': 'Topic cannot exceed 200 characters'
    }),

    type: Joi.number().valid(1, 2, 3, 8).default(2).messages({
        'number.base': 'Type must be a number',
        'any.only':
            'Type must be 1 (Instant), 2 (Scheduled), 3 (Recurring no fixed time), or 8 (Recurring fixed time)'
    }),

    startTime: Joi.date()
        .iso()
        .min('now')
        .when('type', {
            is: Joi.number().valid(2, 8),
            then: Joi.required(),
            otherwise: Joi.optional()
        })
        .messages({
            'date.base': 'Start time must be a valid date',
            'date.min': 'Start time must be in the future',
            'any.required': 'Start time is required for scheduled meetings'
        }),

    duration: Joi.number().integer().min(1).max(1440).default(60),

    timezone: Joi.string().default('UTC'),

    password: Joi.string().max(10).allow(''),

    agenda: Joi.string().max(2000).allow(''),

    settings: Joi.object({
        hostVideo: Joi.boolean().default(false),
        participantVideo: Joi.boolean().default(false),
        cnMeeting: Joi.boolean().default(false),
        inMeeting: Joi.boolean().default(false),
        joinBeforeHost: Joi.boolean().default(false),
        muteUponEntry: Joi.boolean().default(true),
        watermark: Joi.boolean().default(false),
        usePmi: Joi.boolean().default(false),
        approvalType: Joi.number().valid(0, 1, 2).default(2),
        registrationType: Joi.number().valid(1, 2, 3).default(1),
        audio: Joi.string().valid('both', 'telephony', 'voip').default('both'),
        autoRecording: Joi.string().valid('local', 'cloud', 'none').default('none'),
        waitingRoom: Joi.boolean().default(true),
        contactName: Joi.string().max(100).allow(''),
        contactEmail: Joi.string().email().allow('')
    }).default({}),

    recurrence: Joi.object({
        type: Joi.number().valid(1, 2, 3).required(),
        repeatInterval: Joi.number().integer().min(1).max(90).required(),

        weeklyDays: Joi.string()
            .pattern(/^[1-7](,[1-7])*$/)
            .when('type', { is: 2, then: Joi.required() }),

        monthlyDay: Joi.number().integer().min(1).max(31).when('type', {
            is: 3,
            then: Joi.optional(),
            otherwise: Joi.forbidden()
        }),

        monthlyWeek: Joi.number().valid(-1, 1, 2, 3, 4).when('type', {
            is: 3,
            then: Joi.optional(),
            otherwise: Joi.forbidden()
        }),

        monthlyWeekDay: Joi.number().valid(1, 2, 3, 4, 5, 6, 7).when(
            'monthlyWeek',
            {
                is: Joi.exist(),
                then: Joi.required()
            }
        ),

        endTimes: Joi.number().integer().min(1).max(50),
        endDateTime: Joi.date().iso().min('now')
    }).when('type', {
        is: Joi.number().valid(3, 8),
        then: Joi.optional(),
        otherwise: Joi.forbidden()
    })
});

// Update Meeting Validation Schema
const updateMeetingSchema = Joi.object({
    topic: Joi.string().min(1).max(200),
    type: Joi.number().valid(1, 2, 3, 8),
    startTime: Joi.date().iso().min('now'),
    duration: Joi.number().integer().min(1).max(1440),
    timezone: Joi.string(),
    password: Joi.string().max(10).allow(''),
    agenda: Joi.string().max(2000).allow(''),
    settings: Joi.object({
        hostVideo: Joi.boolean(),
        participantVideo: Joi.boolean(),
        cnMeeting: Joi.boolean(),
        inMeeting: Joi.boolean(),
        joinBeforeHost: Joi.boolean(),
        muteUponEntry: Joi.boolean(),
        watermark: Joi.boolean(),
        usePmi: Joi.boolean(),
        approvalType: Joi.number().valid(0, 1, 2),
        registrationType: Joi.number().valid(1, 2, 3),
        audio: Joi.string().valid('both', 'telephony', 'voip'),
        autoRecording: Joi.string().valid('local', 'cloud', 'none'),
        waitingRoom: Joi.boolean(),
        contactName: Joi.string().max(100).allow(''),
        contactEmail: Joi.string().email().allow('')
    })
}).min(1);

// Query Validation
const getMeetingsQuerySchema = Joi.object({
    status: Joi.string().valid('waiting', 'started', 'finished', 'cancelled'),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
});

// Middleware
const validateRequest = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.details.map(d => ({
                field: d.path.join('.'),
                message: d.message
            }))
        });
    }

    req.body = value;
    next();
};

const validateQuery = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true
    });

    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Query validation failed',
            errors: error.details.map(d => ({
                field: d.path.join('.'),
                message: d.message
            }))
        });
    }

    req.query = value;
    next();
};

// ✅ Default export
export default {
    createMeetingSchema,
    updateMeetingSchema,
    getMeetingsQuerySchema,
    validateRequest,
    validateQuery
};
