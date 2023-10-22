import * as z from 'zod';

export const UserValidation = z.object({
  bio: z
    .string()
    .min(3, { message: 'Minimum 3 characters.' })
    .max(1_000, { message: 'Maximum 1000 characters.' }),
  name: z
    .string()
    .min(3, { message: 'Minimum 3 characters.' })
    .max(30, { message: 'Maximum 30 characters.' }),
  profile_photo: z.string().url().nonempty(),
  username: z
    .string()
    .min(3, { message: 'Minimum 3 characters.' })
    .max(30, { message: 'Maximum 30 characters.' }),
});
