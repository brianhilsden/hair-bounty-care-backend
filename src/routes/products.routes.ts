import { Router } from 'express';
import { ProductsController } from '../controllers/products.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const productsController = new ProductsController();

// Public
router.get('/categories', (req, res, next) => productsController.getCategories(req, res, next));
router.get('/', (req, res, next) => productsController.getProducts(req, res, next));
router.get('/:id', (req, res, next) => productsController.getProduct(req, res, next));

// Orders (auth required)
router.post('/orders', authenticate, (req, res, next) => productsController.createOrder(req, res, next));
router.get('/orders', authenticate, (req, res, next) => productsController.getOrders(req, res, next));
router.get('/orders/:id', authenticate, (req, res, next) => productsController.getOrder(req, res, next));

export default router;
