import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import validateRequest from '../middlewares/validateRequest.js'; // Importa o middleware
import { createProductSchema, updateProductSchema } from '../schemas/product.schema.js'; // Importa as regras

const prisma = new PrismaClient();
const productRoutes = Router();

// Adicionamos o middleware de validação ANTES da lógica da rota
productRoutes.post(
  '/products', 
  validateRequest(createProductSchema), // CHECKPOINT AQUI
  async (request, response) => {
    try {
    const { name, description, price } = request.body;
    const product = await prisma.product.create({
      data: { name, description, price },
    });
    return response.status(201).json(product);
    } catch (error) {
    return response.status(500).json({ message: 'Erro ao criar o produto.' });
    }
  }
);

productRoutes.get('/products', async (request, response) => {
    try {
    const products = await prisma.product.findMany();
    return response.status(200).json(products);
    } catch (error) {
    return response.status(500).json({ message: 'Erro ao buscar os produtos.' });
  }
});

productRoutes.get('/products/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      return response.status(404).json({ message: 'Produto não encontrado.' });
    }
    return response.status(200).json(product);
  } catch (error) {
    return response.status(500).json({ message: 'Erro ao buscar o produto.' });
  }
});

// Adicionamos o middleware na rota de atualização também
productRoutes.put(
  '/products/:id', 
  validateRequest(updateProductSchema), // CHECKPOINT AQUI
  async (request, response) => {
    try {
    const { id } = request.params;
    const { name, description, price } = request.body;
    const productExists = await prisma.product.findUnique({ where: { id } });
    if (!productExists) {
      return response.status(404).json({ message: 'Produto não encontrado.' });
    }
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { name, description, price },
    });
    return response.status(200).json(updatedProduct);
    } catch (error) {
    return response.status(500).json({ message: 'Erro ao atualizar o produto.' });
    }
  }
);

productRoutes.delete('/products/:id', async (request, response) => {
  try {
    const { id } = request.params;
    const productExists = await prisma.product.findUnique({ where: { id } });
    if (!productExists) {
      return response.status(404).json({ message: 'Produto não encontrado.' });
    }
    await prisma.product.delete({
      where: { id },
    });
    return response.status(204).send();
    } catch (error) {
    return response.status(500).json({ message: 'Erro ao deletar o produto.' });
  }
});

export default productRoutes;