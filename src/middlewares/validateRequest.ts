import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

// middleware de validação
const validateRequest = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Tenta validar o corpo, parâmetros e query da requisição com o schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next(); // Se a validação passar, continua para a próxima função (o controller)
    } catch (error) {
      // Se a validação falhar, retorna um erro 400 com os detalhes
      return res.status(400).json(error);
    }
};

export default validateRequest;