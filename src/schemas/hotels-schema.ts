import Joi from 'joi';

const hotelSchema = Joi.object({ id: Joi.number().required() });

export { hotelSchema };
