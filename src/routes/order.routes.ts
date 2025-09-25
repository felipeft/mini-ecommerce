import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const orderRoutes = Router();

// --- ROTAS DE PEDIDOS (CHECKOUT) ---

// ROTA PARA CRIAR UM PEDIDO (CHECKOUT)
orderRoutes.post('/orders', async (request, response) => {
  try {
    const userEmail = 'felipe@teste.com';
    const user = await prisma.user.findUnique({ where: { email: userEmail } });

    if (!user) {
      return response.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 1. Encontra o carrinho do usuário com todos os seus itens e produtos
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return response.status(400).json({ message: 'Seu carrinho está vazio.' });
    }

    // 2. Inicia uma TRANSAÇÃO
    const createdOrder = await prisma.$transaction(async (tx) => {
      // a. Calcula o valor total do pedido
      const totalAmount = cart.items.reduce((total, item) => {
        return total + Number(item.product.price) * item.quantity;
      }, 0);

      // b. Cria o Pedido (Order)
      const order = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount: totalAmount,
          status: 'PENDING',
        },
      });

      // c. Cria os Itens do Pedido (OrderItems) com base nos itens do carrinho
      const orderItemsData = cart.items.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
      }));
      
      await tx.orderItem.createMany({
        data: orderItemsData,
      });

      // d. Limpa o carrinho do usuário
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      
      return order; // Retorna o pedido criado
    });

    return response.status(201).json(createdOrder);

  } catch (error) {
    console.error(error);
    return response.status(500).json({ message: 'Erro ao criar o pedido.' });
  }
});

// ROTA EXTRA: Listar todos os pedidos de um usuário
orderRoutes.get('/orders', async (request, response) => {
    try {
        const userEmail = 'felipe@teste.com';
        const user = await prisma.user.findUnique({ where: { email: userEmail } });

        if (!user) {
            return response.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const orders = await prisma.order.findMany({
            where: { userId: user.id },
            include: { items: { include: { product: true } } } // Inclui os itens e produtos de cada pedido
        });

        return response.status(200).json(orders);
    } catch (error) {
        return response.status(500).json({ message: 'Erro ao buscar pedidos.' });
    }
});

export default orderRoutes;