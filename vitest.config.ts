import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Apaga 'environment' e 'setupFiles'.
    // Usa 'globalSetup' para apontar para o script.
    globalSetup: ['./prisma/vitest-environment-setup.ts'],
    testTimeout: 10000, // Aumenta o tempo limite para os testes
  },
});