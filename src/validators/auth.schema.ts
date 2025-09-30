import { z } from 'zod';

export const signupSchema = z.object({
    firstName: z.string().trim().min(1, { message: 'First name is required.' }),

    lastName: z.string().trim().optional(),

    email: z.email({ message: 'Please enter a valid email address.' }).trim(),

    phone: z
        .string()
        .trim()
        .min(1, { message: 'Phone number is required.' })
        .regex(/^\+?[0-9]{11}$/, {
            message: 'Please enter a valid phone number (11 digits).',
        }),

    password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters long.' })
        .max(64, { message: 'Password must be less than 64 characters.' })
        .regex(/[A-Z]/, {
            message: 'Password must contain at least one uppercase letter.',
        })
        .regex(/[a-z]/, {
            message: 'Password must contain at least one lowercase letter.',
        })
        .regex(/[0-9]/, {
            message: 'Password must contain at least one number.',
        })
        .regex(/[@$!%*?&]/, {
            message:
                'Password must contain at least one special character (@$!%*?&).',
        }),
});

export type SignUpFormValues = z.infer<typeof signupSchema>;
