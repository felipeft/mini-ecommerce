import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Este bloco será executado ANTES de CADA teste 'it' neste arquivo
beforeEach(async () => {
  // Deleta todos os registros da tabela de produtos, garantindo um estado limpo
  await prisma.product.deleteMany();
});

describe('Rotas de Produto', () => {

  it('deve ser capaz de criar um novo produto', async () => {
    const response = await request(app)
      .post('/products')
      .send({
        name: 'Produto de Teste via Vitest',
        description: 'Descrição do produto de teste.',
        price: 199.99,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Produto de Teste via Vitest');
  });

  it('deve ser capaz de listar todos os produtos', async () => {
    // Cria um produto para garantir que a lista não esteja vazia
    await request(app)
      .post('/products')
      .send({
        name: 'Produto na Lista de Teste',
        description: 'Descrição do produto.',
        price: 123.45,
      });

    const response = await request(app).get('/products');

    expect(response.status).toBe(200);
    // Agora, a lista terá APENAS 1 item, pois o beforeEach limpou o do teste anterior
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Produto na Lista de Teste');
  });

});