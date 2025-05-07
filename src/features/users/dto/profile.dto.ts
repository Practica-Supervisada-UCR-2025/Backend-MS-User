import * as yup from 'yup';

export const updateUserProfileSchema = yup.object({
  email: yup
    .string()
    .email('El formato del correo no es válido')
    .matches(
      /^[\w-.]+@ucr\.ac\.cr$/,
      'El correo debe ser institucional de la UCR (@ucr.ac.cr)'
    )
    .required('El correo electrónico es obligatorio'),

  username: yup
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(20, 'El nombre de usuario no debe superar los 20 caracteres')
    .matches(
      /^[a-zA-Z0-9._-]+$/,
      'El nombre de usuario solo puede contener letras, números, puntos, guiones y guiones bajos'
    )
    .optional(),

  full_name: yup
    .string()
    .trim()
    .min(3, 'El nombre completo debe tener al menos 3 caracteres')
    .max(25, 'El nombre completo no debe superar los 25 caracteres')
    .matches(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'El nombre completo solo puede contener letras y espacios'
    )
    .optional(),

  profile_picture: yup
    .string()
    .url('La URL de la imagen de perfil debe ser válida')
    .optional()
});

export const updateAdminProfileSchema = yup.object({
  email: yup
    .string()
    .email('El formato del correo no es válido')
    .matches(
      /^[\w-.]+@ucr\.ac\.cr$/,
      'El correo debe ser institucional de la UCR (@ucr.ac.cr)'
    )
    .required('El correo electrónico es obligatorio'),

  full_name: yup
    .string()
    .trim()
    .min(3, 'El nombre completo debe tener al menos 3 caracteres')
    .max(25, 'El nombre completo no debe superar los 25 caracteres')
    .matches(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'El nombre completo solo puede contener letras y espacios'
    )
    .optional(),

  profile_picture: yup
    .string()
    .url('La URL de la imagen de perfil debe ser válida')
    .optional()
});

export type UpdateUserProfileDTO = yup.InferType<typeof updateUserProfileSchema>;
export type UpdateAdminProfileDTO = yup.InferType<typeof updateAdminProfileSchema>;