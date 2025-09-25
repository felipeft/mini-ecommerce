import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const cartRoutes = Router();

// --- ROTAS DO CARRINHO ---

// ROTA PARA ADICIONAR UM PRODUTO AO CARRINHO
cartRoutes.post('/cart/add', async (request, response) => {
  try {
    const { productId, quantity } = request.body;
    const userEmail = 'felipe@teste.com';
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return response.status(404).json({ message: 'Usuário não encontrado.' });
    }
    let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: user.id } });
    }
    const cartItemExists = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: productId },
    });
    if (cartItemExists) {
      await prisma.cartItem.update({
        where: { id: cartItemExists.id },
        data: { quantity: cartItemExists.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: productId, quantity: quantity },
      });
    }
    return response.status(200).json({ message: 'Produto adicionado ao carrinho!' });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Erro ao adicionar produto ao carrinho.' });
  }
});

// ROTA PARA VER O CARRINHO
cartRoutes.get('/cart', async (request, response) => {
  try {
    const userEmail = 'felipe@teste.com';
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return response.status(404).json({ message: 'Usuário não encontrado.' });
    }
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!cart) {
      return response.status(200).json({ id: null, userId: user.id, items: [] });
    }
    return response.status(200).json(cart);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Erro ao buscar o carrinho.' });
  }
});

// ROTA PARA REMOVER UM ITEM DO CARRINHO
cartRoutes.delete('/cart/item/:cartItemId', async (request, response) => {
  try {
    const { cartItemId } = request.params; // Captura o ID do item da URL

    // Verifica se o item do carrinho realmente existe
    const cartItemExists = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });
    if (!cartItemExists) {
      return response.status(404).json({ message: 'Item do carrinho não encontrado.' });
    }

    // Deleta o item do carrinho
    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return response.status(204).send(); // Resposta de sucesso sem conteúdo
  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Erro ao remover item do carrinho.' });
  }
});

export default cartRoutes;