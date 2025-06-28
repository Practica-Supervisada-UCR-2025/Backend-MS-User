import * as yup from 'yup';

// Validation schema for creating a user suspension
export const createSuspensionSchema = yup.object({
  user_id: yup
    .string()
    .uuid('user_id must be a valid UUID')
    .required('user_id is required'),

  days: yup
    .number()
    .integer('days must be an integer')
    .min(1, 'days must be at least 1')
    .required('days is required'),

  description: yup
    .string()
    .max(500, 'description must not exceed 500 characters')
    .optional(),
});

export type CreateSuspensionDTO = yup.InferType<typeof createSuspensionSchema>;
