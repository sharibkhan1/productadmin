import * as z from "zod";

export const NewPasswordSchema = z.object({
  password: z
  .string()
  .min(8, { message: 'Your password must be atleast 8 characters long' })
  .max(64, {
    message: 'Your password can not be longer then 64 characters long',
  })
  .refine(
    (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ''),
    'password should contain only alphabets and numbers'
  ),
});

export const ResetSchema = z.object({
  email: z.string().email({ message: 'Incorrect email format' }),
});

export const LoginSchema = z.object({
    email: z.string().email({ message: 'Incorrect email format' }),
    password: z
    .string()
    .min(8, { message: 'Your password must be atleast 8 characters long' })
    .max(64, {
      message: 'Your password can not be longer then 64 characters long',
    })
    .refine(
      (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ''),
      'password should contain only alphabets and numbers'
    ),
    code: z.optional(z.string()),
});

export const RegisterSchema = z.object({
  email: z.string().email({ message: 'Incorrect email format' }),
  password: z
  .string()
  .min(8, { message: 'Your password must be atleast 8 characters long' })
  .max(64, {
    message: 'Your password can not be longer then 64 characters long',
  })
  .refine(
    (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ''),
    'password should contain only alphabets and numbers'
  ),
  passwordAgain: z
  .string()
  .min(8, { message: 'Your password must be atleast 8 characters long' })
  .max(64, {
    message: 'Your password can not be longer then 64 characters long',
  })
  .refine(
    (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ''),
    'password should contain only alphabets and numbers'
  ),
});