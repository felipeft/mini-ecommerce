import { z } from 'zod';

// Regras para CRIAR um produto
export const createProductSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'O nome é obrigatório.',
    }).min(3, 'O nome precisa ter no mínimo 3 caracteres.'),

    description: z.string({
      required_error: 'A descrição é obrigatória.',
    }),

    price: z.number({
      required_error: 'O preço é obrigatório.',
    }).positive('O preço deve ser um número positivo.'),
  }),
});

// Regras para ATUALIZAR um produto
// .partial() para tornar todos os campos opcionais na atualização
export const updateProductSchema = createProductSchema.partial();