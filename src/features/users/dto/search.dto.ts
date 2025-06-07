import * as yup from 'yup';

export const searchUsersSchema = yup.object({
    name: yup.string().trim().required('El nombre es obligatorio')
});

export type SearchUsersDTO = yup.InferType<typeof searchUsersSchema>;