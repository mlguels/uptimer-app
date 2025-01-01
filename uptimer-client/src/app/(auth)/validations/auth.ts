import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string({ required_error: 'Username is a required field' })
    .min(4, { message: 'Please provide a username' })
    .optional(),
  email: z.string({ required_error: 'Email is a required field' }).email(),
  password: z
    .string({ required_error: 'Password is a required field' })
    .min(4, { message: 'Password must be at least 4 characters long' })
    .optional(),
});

export type RegisterType = z.infer<typeof registerSchema>;
