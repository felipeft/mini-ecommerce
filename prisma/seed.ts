import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Deleta o usuário antigo, se existir, para evitar erros
  await prisma.user.deleteMany({});

  const user = await prisma.user.create({
    data: {
      email: 'felipe@teste.com',
      name: 'Felipe Teste',
    },
  });

  console.log(`Usuário de teste criado: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });