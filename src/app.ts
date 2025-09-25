import express from 'express';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';

const app = express();

app.use(express.json());

app.use(productRoutes);
app.use(cartRoutes);
app.use(orderRoutes);

export default app; // Exporta a aplicação